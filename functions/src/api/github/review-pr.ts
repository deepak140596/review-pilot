import { Octokit } from "octokit";
import * as admin from "firebase-admin";
import * as express from 'express';
import { prReviewLLMResponse } from "../ai/prompts/review-prompt";
import axios from "axios";

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();

export async function reviewPR(req: express.Request, octokit: Octokit, token: string) {
    const prNumber = req.body.pull_request.number as number;
    const repoName = req.body.repository.name as string;
    const owner = req.body.repository.owner.login as string;
    const pullUrl = req.body.pull_request.url as string;

    console.log(`owner: ${owner} repo: ${repoName} prNumber: ${prNumber}`);

    await deletePendingReview(owner, repoName, prNumber, octokit);
    const diffText = await getDiff(pullUrl, token);
    const filteredDiff = filterDiff(diffText);
    const llmResponse = await getLLMReponse(filteredDiff);
    const body = llmResponse.body;
    const comments = llmResponse.comments;
    console.log(`LLM Response Body: ${body} comments: ${JSON.stringify(comments)}`);

    const review = await octokit.rest.pulls.createReview({
        owner: owner,
        repo: repoName,
        pull_number: prNumber,
        body: llmResponse.body,
        event: 'COMMENT',
        comments: llmResponse.comments
    });

    return review;
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

async function getLLMReponse(diffText: string) {
    const llmConfig = (await db.doc('admin/llm').get()).data() ?? {};
    const model = llmConfig.model;
    const version = llmConfig.version;
    console.log(`model: ${model}  version: ${version}`)
    const llmResponse = await prReviewLLMResponse(model, version, diffText)
    const convertedJSON = JSON.parse(llmResponse);
    return convertedJSON
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
        // /^diff --git a\/.*\.scss b\/.*\.scss$/, // SCSS files
        // /^diff --git a\/.*\.css b\/.*\.css$/  // CSS files
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