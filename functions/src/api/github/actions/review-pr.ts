import { Octokit } from "octokit";
import * as express from 'express';
import { getLLMResponse } from "../../ai/prompts/review-prompt";
import axios from "axios";
import * as admin from "firebase-admin";
import { RepositorySettings } from "../../../models/repository-settings";
import { getHighLevelSummaryFromLLM } from "../../ai/prompts/high-level-summary";
import { HighLevelSummary } from "../../../models/high-level-summary";
const stringSimilarity = require('string-similarity');

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
            
                try { 
                    const review = await saveComments(octokit, owner, repoName, prNumber, comments);
                    return review;
                } catch (error) {
                    console.error("Error saving comments:", JSON.stringify(error));
                    return {message: "Error saving comments"}
                }
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

async function getDiff(pullUrl: string, token: string): Promise<string> {
    const response = await axios.get(pullUrl, {
        headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3.diff"
        }
    });
    return response.data;
}

async function deletePendingReview(owner: string, repo: string, pull_number: number, octokit: Octokit) {
    const pendingReview = await findPendingReview(owner, repo, pull_number, octokit);
    const reviewId = pendingReview?.id as number;
    console.log(`pending review id: ${reviewId}`);

    if (reviewId) {
        await octokit.rest.pulls.deletePendingReview({
            owner: owner,
            repo: repo,
            pull_number: pull_number,
            review_id: reviewId,
        });
    } else {
        return;
    }
}

async function findPendingReview(owner: string, repo: string, pull_number: number, octokit: Octokit) {
    const { data: reviews } = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number,
    });
    const pendingReview = reviews.find(review => review.state === "PENDING");
    return pendingReview;
  }

async function getCommmentsFromLLm(diff: string) {
    const filteredDiff = filterDiff(diff);
    const fileSections = splitDiff(filteredDiff);
    const groups = splitIntoGroups(fileSections, 10); // Splits into 10 groups

    console.log(`Groups length: ${groups.length}`);
    const promises = groups.map(async group => {
        return getLLMResponse(group);
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

function filterDiff(diffContent: string) {
    // Split the diff into lines for easier processing
    const lines = diffContent.split('\n');

    // Flag to indicate if we are within a block that should be retained
    let retainBlock = false;

    // Define patterns that indicate the start of code file diffs
    const codeFilePatterns = [
		/^diff --git a\/.*\.tsx b\/.*\.tsx$/, // TSX files
        /^diff --git a\/.*\.ts b\/.*\.ts$/,   // TypeScript files
        /^diff --git a\/.*\.js b\/.*\.js$/,   // JavaScript files
        /^diff --git a\/.*\.jsx b\/.*\.jsx$/, // JSX files
        /^diff --git a\/.*\.html b\/.*\.html$/, // HTML files
        /^diff --git a\/.*\.scss b\/.*\.scss$/, // SCSS files
        /^diff --git a\/.*\.css b\/.*\.css$/,  // CSS files

        // Android files
        /^diff --git a\/.*\.java b\/.*\.java$/, // Java files
        /^diff --git a\/.*\.kt b\/.*\.kt$/, // Kotlin files
        /^diff --git a\/.*\.xml b\/.*\.xml$/, // XML files
        /^diff --git a\/.*\.gradle b\/.*\.gradle$/, // Gradle files

        // IOS files
        /^diff --git a\/.*\.swift b\/.*\.swift$/, // Swift files
        /^diff --git a\/.*\.m b\/.*\.m$/, // Objective-C files
        /^diff --git a\/.*\.plist b\/.*\.plist$/, // Plist files
        /^diff --git a\/.*\.storyboard b\/.*\.storyboard$/, // Storyboard files

        // Flutter files
        /^diff --git a\/.*\.dart b\/.*\.dart$/, // Dart files
        /^diff --git a\/.*\.json b\/.*\.json$/, // JSON files

        // Python files
        /^diff --git a\/.*\.py b\/.*\.py$/, // Python files

        // Ruby files
        /^diff --git a\/.*\.rb b\/.*\.rb$/, // Ruby files

        // Go files
        /^diff --git a\/.*\.go b\/.*\.go$/, // Go files

        // PHP files
        /^diff --git a\/.*\.php b\/.*\.php$/, // PHP files

        // C# files
        /^diff --git a\/.*\.cs b\/.*\.cs$/, // C# files

        // C++ files
        /^diff --git a\/.*\.cpp b\/.*\.cpp$/, // C++ files

        // C files
        /^diff --git a\/.*\.c b\/.*\.c$/, // C files

        // Rust files
        /^diff --git a\/.*\.rs b\/.*\.rs$/, // Rust files

        // Shell files
        /^diff --git a\/.*\.sh b\/.*\.sh$/, // Shell files

        // SQL files
        /^diff --git a\/.*\.sql b\/.*\.sql$/, // SQL files

        // Docker files
        /^diff --git a\/.*\.dockerfile b\/.*\.dockerfile$/, // Docker files

        // YAML files
        /^diff --git a\/.*\.yml b\/.*\.yml$/, // YAML files

        // Terraform files
        /^diff --git a\/.*\.tf b\/.*\.tf$/, // Terraform files

        // Markdown files
        /^diff --git a\/.*\.md b\/.*\.md$/, // Markdown files


    ];

    // Filter lines, retaining only blocks that match the code file patterns
    const filteredLines = lines.filter(line => {
        if (codeFilePatterns.some(pattern => pattern.test(line))) {
            retainBlock = true;  // Start retaining this block
            return true; // Ensure the diff --git line itself is also retained
        } else if (line.startsWith('diff --git') && retainBlock) {
            retainBlock = false; // End of the retained block and start of a new block
        }

        // Return true to keep the line, false to remove it
        return retainBlock;
    });

    // Join the remaining lines back into a single string
    return filteredLines.join('\n');
}

function splitDiff(diff: string): string[][] {
    const lines = diff.split('\n');

    // Store arrays of lines, each array is one file's diff
    let currentFileLines: string[] = [];
    const fileSections: string[][] = [];

    lines.forEach(line => {
        if (line.startsWith('diff --git')) {
            if (currentFileLines.length > 0) {
                fileSections.push(currentFileLines);
                currentFileLines = [];
            }
        }
        currentFileLines.push(line);
    });

    // Don't forget to add the last set of lines
    if (currentFileLines.length > 0) {
        fileSections.push(currentFileLines);
    }

    return fileSections;
}

function splitIntoGroups(fileSections: string[][], numberOfGroups : number): string[] {
    const groups: string[][] = new Array(numberOfGroups).fill(null).map(() => []);
    let currentGroupIndex = 0;

    fileSections.forEach(section => {
        const group = groups[currentGroupIndex];
        group.push(section.join('\n')); // Add the whole file section as a single string

        // Move to the next group, wrap around if necessary
        currentGroupIndex = (currentGroupIndex + 1) % numberOfGroups;
    });

    const filteredGroup = groups.filter((group, index) => {
       return group.length > 0
    })

    let splitGroups: string[] = []
    filteredGroup.forEach((group, index) => {
       const joinedFile = group.join('\n')
       splitGroups.push(joinedFile)
    })
    return splitGroups;
}

function labelsToCommaSeparatedString(labels: { name: string }[]): string {
    return labels.map(label => label.name).join(', ');
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

async function updatePRDescription(
    owner: string, repo: string, 
    pull_number: number, octokit: Octokit,
    summary: HighLevelSummary
) {
    const newBody =`
<!-- This is an auto-generated comment: release notes by ReviewPilot -->
## Summary by ReviewPilot

${generateTextSummary(summary)}

<!-- end of auto-generated comment: release notes by coderabbit.ai -->
    `
    try {
        const response = await octokit.rest.pulls.update({
            owner,
            repo,
            pull_number,
            body: newBody
        });
        console.log("Pull request updated successfully:");
    } catch (error) {
        console.error("Error updating pull request:", error);
    }
}

function generateTextSummary(summary: HighLevelSummary) {
    let text = '';
    if (summary.styles) {
        text += generateSection('Style', summary.styles);
    }
    if (summary.bugFixes) {
        text += generateSection('Bug Fixes', summary.bugFixes);
    }
    if (summary.chores) {
        text += generateSection('Chores', summary.chores);
    }
    if (summary.refactors) {
        text += generateSection('Refactor', summary.refactors);
    }
    if (summary.newFeatures) {
        text += generateSection('New Features', summary.newFeatures);
    }
    return text;
}

function generateSection(title: string, items: string[]) {

    if (items.length === 0) {
        return '';
    }

    let text = `- **${title}**\n`;
    items.forEach(item => {
        text += `\t- ${item}\n`;
    });
    return text;
}

async function filterDuplicateComments(existingComments: any[], newComments: any[]) {

    const threshold = 0.5;
    const filteredComments: any[] = [];

    newComments.forEach(newComment => {
        var isDuplicate = false;
        console.log(`Calculating similarity for comment: ${newComment.body}`);
        existingComments.forEach(existingComment => {
            try {
                if (existingComment.path === newComment.path) {
                    const similarity = stringSimilarity.compareTwoStrings(newComment.body, existingComment.body);
                    console.log(`Similarity: ${similarity}`)
                    console.log(`Existing comment: ${existingComment.body}` )
                    if (similarity >= threshold) {
                        isDuplicate = true;
                    }
                }
            } catch (error) {
                console.error(`Error comparing comments: ${error}`);
            }
        });
        if (!isDuplicate) {
            filteredComments.push(newComment);
            console.log(`Result : New comment`);
        } else {
            console.log(`Result : Duplicate comment`);
        }
    })

    return filteredComments;
}

async function getExistingComments(octokit: Octokit, owner: string, repo: string, prNumber: number) {
    const { data: comments } = await octokit.rest.pulls.listReviewComments({
        owner,
        repo,
        pull_number: prNumber
    });
    return comments;
}

async function saveComments(octokit: Octokit, owner: string, 
    repoName: string, prNumber: number, comments: any[]
) {
    const existingComments = await getExistingComments(octokit, owner, repoName, prNumber);
    const filteredComments = await filterDuplicateComments(existingComments, comments);
    const validComments = await validateCommentPositions(octokit, owner, repoName, prNumber, filteredComments);
    
    const review = await octokit.rest.pulls.createReview({
        owner: owner,
        repo: repoName,
        pull_number: prNumber,
        body: 'Here are some suggestions for your PR:\n\n',
        event: 'COMMENT',
        comments: validComments
    });

    return review;
}


async function validateCommentPositions(octokit: Octokit, owner: string, repo: string, prNumber: number, comments: any[]): Promise<any[]> {
    const validComments = [];

    // Fetch the list of files changed in the pull request
    const response = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber
    });

    const files = response.data;

    for (const comment of comments) {
        const diffHunk = getDiffHunk(files, comment.path, comment.position);
        if (diffHunk) {
            validComments.push(comment);
        }
    }

    return validComments;
}

function getDiffHunk(files: any[], filePath: string, position: number): string | null {
    for (const file of files) {
        if (file.filename === filePath) {
            const lines = file.patch.split('\n');
            if (position <= lines.length) {
                return lines[position - 1];
            }
        }
    }

    return null;
}