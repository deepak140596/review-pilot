import { Octokit } from "octokit";
import * as express from 'express';
import * as admin from "firebase-admin";
import { RepositorySettings } from "../../../models/repository-settings";
import { getHighLevelSummaryFromLLM } from "../../ai/prompts/high-level-summary";
import { HighLevelSummary } from "../../../models/high-level-summary";
import { deletePendingReview, getDiff, saveReview, updatePRDescription } from "../octokit/rest-calls";
import { getPRReviewFromLLM } from "../../ai/prompts/review-prompt";
import { addPositionToDiffHunks, filterDiff, labelsToCommaSeparatedString, splitDiff, splitIntoGroups } from "../utils/diff";

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();

export async function reviewPR(req: express.Request, octokit: Octokit, token: string, isIncrementalReview: boolean = false) {
    const prNumber = req.body.pull_request.number as number;
    const repoName = req.body.repository.name as string;
    const owner = req.body.repository.owner.login as string;
    const pullUrl = req.body.pull_request.url as string;

    console.log(`owner: ${owner} repo: ${repoName} prNumber: ${prNumber}`);

    const repositorySettings = await getRepositorySettings(req.body)
    
    try {
        const shouldGenerateHighLevelSummary = repositorySettings?.high_level_summary;
        if (shouldGenerateHighLevelSummary) {
            const diff = await getDiff(pullUrl, token);
            const summary = await generateHighLevelSummary(diff);
            await updatePRDescription(owner, repoName, prNumber, octokit, summary);
        }
    } catch (error) {
        console.log(`Error generating high level summary: ${error}`);
    }

    const isPro = await isOwnerProOrTrial(req.body);

    if (!isPro) {
        console.log('User is not pro');
        return {message: "User is not pro"}
    } else {
        if (repositorySettings) {
            const shouldReviewPR = await matchPRConditions(req.body, repositorySettings, isIncrementalReview)
            console.log(`Should Review PR: ${shouldReviewPR}`)
            if (shouldReviewPR) {
                await deletePendingReview(owner, repoName, prNumber, octokit);
                const diffText = await getDiff(pullUrl, token);
                const comments = await getCommmentsFromLLm(diffText);
                console.log(`LLM Response comments: ${JSON.stringify(comments)}`);
            
                const review = await saveReview(octokit, owner, repoName, prNumber, comments);
                return review;
            }
        }

        return {message: "PR not reviewed"}
    }
}

async function matchPRConditions(
    payload: any, 
    repoSettings: RepositorySettings, 
    isIncrementalReview: boolean
): Promise<boolean> {

    if (repoSettings === null) {
        console.log('Repo settings not found');
        return true
    }
    
    if (!repoSettings.automated_reviews && !isIncrementalReview) {
        const action = payload.action;
        if (action !== 'opened') {
            console.log('Not automated reviews');
            return false
        }
    }

    const isDraftRepo = payload.pull_request.draft as boolean;
    if (!repoSettings.draft_pull_request_reviews && isDraftRepo) {
        console.log('Not draft reviews');
        return false
    }

    const labels = labelsToCommaSeparatedString(payload.pull_request.labels);
    const titleAndLabels = `${payload.pull_request.title} ${labels}`
    const ignoreKeywords = repoSettings.ignore_title_keywords.split(',').map(keyword => keyword.trim().toLowerCase());
    for (const keyword of ignoreKeywords) {
        if (keyword && titleAndLabels.toLowerCase().includes(keyword)) {
            console.log(`Ignoring keyword: ${keyword}`);
            return false;
        }
    }

    
    if (repoSettings.target_branches === undefined 
        || repoSettings.target_branches === null 
        || repoSettings.target_branches === '') {
        return true;
    }
    const branchName = payload.pull_request.head.ref;
    const targetBranches = repoSettings.target_branches.split(',').map(branch => branch.trim());
    for (const targetBranch of targetBranches) {
        const regex = new RegExp(`^${targetBranch.replace('*', '.*')}$`);
        if (regex.test(branchName)) {
            console.log(`Target branch: ${targetBranch} matched`);
            return true;
        }
    }

    console.log(`Target branch not matched: ${branchName}`);
    return false;
}

async function isOwnerProOrTrial(payload: any) : Promise<boolean> {
    const ownerType = payload.repository.owner.type;
    var isPro = false;
    if (ownerType === 'Organization') {
        const ownerLogin = payload.repository.owner.login;
        const orgAccount = (await db.collection('organisations').doc(`${ownerLogin}`).get()).data();
        if (orgAccount === undefined || orgAccount === null) {
            return false
        }
        isPro = orgAccount['pro'] as boolean;

        if (!isPro) {
            isPro = isTrial(orgAccount);
        }
    } else {
        const ownerId = payload.repository.owner.id;
        try {
            const userAccount = (await db.collection('users').where('id', '==', ownerId).limit(1).get()).docs[0]
            if (userAccount === undefined || userAccount === null) {
                return false
            }
            isPro = userAccount.data()['pro'] as boolean;
            if (!isPro) {
                isPro = isTrial(userAccount);
            }
        } catch (error) {
            return false
        }
    }
    return isPro;
}

async function getRepositorySettings(payload: any): Promise<RepositorySettings | null> {

    const repoId = payload.repository.id;

    const repoData = (await db.collection('repositories').doc(`${repoId}`).get()).data()
    if (repoData === undefined || repoData === null) {
        return null
    }
    var repoSettings = repoData['repository_settings'] as RepositorySettings;

    if (repoSettings === undefined || repoSettings === null) {
        const ownerType = payload.repository.owner.type;

        if (ownerType === 'Organization') {
            const ownerLogin = payload.repository.owner.login;
            const orgAccount = (await db.collection('organisations').doc(`${ownerLogin}`).get()).data();
            if (orgAccount === undefined || orgAccount === null) {
                return null
            }
            repoSettings = orgAccount['repository_settings'] as RepositorySettings

        } else {
            const ownerId = payload.repository.owner.id;
            try {
                const userAccount = (await db.collection('users').where('id', '==', ownerId).limit(1).get()).docs[0]
                if (userAccount === undefined || userAccount === null) {
                    return null
                }
                repoSettings = userAccount.data()['repository_settings'] as RepositorySettings
            } catch (error) {
                return null
            }
        }        
    }

    console.log(`Repo settings: ${JSON.stringify(repoSettings)}`)
    return repoSettings
}


async function getCommmentsFromLLm(diff: string) {
    const filteredDiff = filterDiff(diff);
    const positionNumberedDiff = addPositionToDiffHunks(filteredDiff);
    const fileSections = splitDiff(positionNumberedDiff);
    const groups = splitIntoGroups(fileSections, 10); // Splits into 10 groups

    console.log(`Groups length: ${groups.length}`);
    const promises = groups.map(async group => {
        return getPRReviewFromLLM(group);
    });
    const responses = await Promise.all(promises);
    var comments : any[] =  [];

    responses.forEach(response => {
        const commentsFromResponse : any[] = response.comments;
        console.log(`Comments: ${JSON.stringify(commentsFromResponse)}`);
        comments.push(...commentsFromResponse);
    });

    return comments;
}


function isTrial(account: any): boolean {
    if (!account.created_at) {
        return false;
    }
    const trialDays = 30;
    const now = new Date();
    const diff = now.getTime() - account.created_at.getTime();
    const diffDays = diff / (1000 * 3600 * 24);
    console.log(`Diff days: ${diffDays}`);
    return diffDays < trialDays;
}

async function generateHighLevelSummary(diff: string) {
    const filteredDiff = filterDiff(diff);
    const fileSections = splitDiff(filteredDiff);
    const groups = splitIntoGroups(fileSections, 20); // Splits into 20 groups

    console.log(`Groups length for high level summary: ${groups.length}`);
    const promises = groups.map(async group => {
        return getHighLevelSummaryFromLLM(group);
    });
    const responses = await Promise.all(promises);
    var highLevelSummary: HighLevelSummary = {};

    responses.forEach((response : HighLevelSummary) => {

        if (response.styles) {
            if (!highLevelSummary.styles) {
                highLevelSummary.styles = [];
            }
            highLevelSummary.styles.push(...response.styles);
        }

        if (response.bugFixes) {
            if (!highLevelSummary.bugFixes) {
                highLevelSummary.bugFixes = [];
            }
            highLevelSummary.bugFixes.push(...response.bugFixes);
        }

        if (response.chores) {
            if (!highLevelSummary.chores) {
                highLevelSummary.chores = [];
            }
            highLevelSummary.chores.push(...response.chores);
        }

        if (response.refactors) {
            if (!highLevelSummary.refactors) {
                highLevelSummary.refactors = [];
            }
            highLevelSummary.refactors.push(...response.refactors);
        }

        if (response.newFeatures) {
            if (!highLevelSummary.newFeatures) {
                highLevelSummary.newFeatures = [];
            }
            highLevelSummary.newFeatures.push(...response.newFeatures);
        }
    });

    console.log(`High level summary: ${JSON.stringify(highLevelSummary)}`);

    return highLevelSummary;
}