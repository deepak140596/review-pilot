import axios from "axios";
import { Octokit } from "octokit";
import { HighLevelSummary } from "../../../models/high-level-summary";
import { filterDuplicateComments, generateTextSummary } from "../utils/comments";
import { getDiffHunk } from "../utils/diff";

export async function getDiff(pullUrl: string, token: string): Promise<string> {
    const response = await axios.get(pullUrl, {
        headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3.diff"
        }
    });
    return response.data;
}

export async function deletePendingReview(owner: string, repo: string, pull_number: number, octokit: Octokit) {
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

export async function updatePRDescription(
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

export async function saveReview(octokit: Octokit, owner: string, 
    repoName: string, prNumber: number, comments: any[]
) {
    const existingComments = await getExistingComments(octokit, owner, repoName, prNumber);
    const filteredComments = await filterDuplicateComments(existingComments, comments);
    const validComments = await validateCommentPositions(octokit, owner, repoName, prNumber, filteredComments);
    
    // TODO: make a final LLM call to remove duplicate comments

    try {
        const review = await octokit.rest.pulls.createReview({
            owner: owner,
            repo: repoName,
            pull_number: prNumber,
            body: 'Here are some suggestions for your PR:\n\n',
            event: 'COMMENT',
            comments: validComments
        });

        return review;
    } catch (error) {
        console.error("Error saving review:", JSON.stringify(error));
        return {message: "Error saving review"};
    }
}

async function getExistingComments(octokit: Octokit, owner: string, repo: string, prNumber: number) {
    const { data: comments } = await octokit.rest.pulls.listReviewComments({
        owner,
        repo,
        pull_number: prNumber
    });
    return comments;
}

export async function validateCommentPositions(octokit: Octokit, owner: string, repo: string, prNumber: number, comments: any[]): Promise<any[]> {
    const validComments = [];

    // Fetch the list of files changed in the pull request
    const response = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber
    });

    const files = response.data;

    for (const comment of comments) {
        try {
            const diffHunk = getDiffHunk(files, comment.path, comment.position);
            if (diffHunk) {
                validComments.push(comment);
            }
        } catch (error) {
            console.error(`Error validating comment position: ${error}`);
        }
    }

    return validComments;
}