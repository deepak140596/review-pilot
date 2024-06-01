import * as express from 'express';
import { reviewPR } from './review-pr';
import { Octokit } from 'octokit';

export async function handleCommands(req: express.Request, octokit: Octokit, token: string) {
    const comment = req.body.comment.body as string;

    if (comment.includes('@reviewpilot-ai/review')) {
        const pullRequest = await octokit.rest.pulls.get({
            owner: req.body.repository.owner.login,
            repo: req.body.repository.name,
            pull_number: req.body.issue.number
        });
        req.body.pull_request = pullRequest.data;
        const reviewResults = await reviewPR(req, octokit, token, true);
        return reviewResults;
    } else {
        return { message: 'No action taken' };
    }
}