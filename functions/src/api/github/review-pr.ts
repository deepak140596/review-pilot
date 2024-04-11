import { Octokit } from "octokit";
import * as admin from "firebase-admin";
import * as express from 'express';
import * as functions from 'firebase-functions';
import { createAppAuth } from "@octokit/auth-app";
import { prReviewLLMResponse } from "../ai/prompts/review-prompt";
import axios from "axios";

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();
const app = express();


app.post('/', async (req, res) => {
    const installationId = req.body.installation.id as number;
    const {octokit, token} = await getAuthenticatedOctokit(installationId);

    const prNumber = req.body.number as number;
    const repoName = req.body.repository.name as string;
    const owner = req.body.repository.owner.login as string;
    const pullUrl = req.body.pull_request.url as string;

    await deletePendingReview(owner, repoName, prNumber, octokit);

    const diffText = await getDiff(pullUrl, token);
    const llmResponse = await getLLMReponse(diffText);
    console.log(`LLM Response : ${llmResponse}`);

    await octokit.rest.pulls.createReview({
        owner: owner,
        repo: repoName,
        pull_number: prNumber,
        body: llmResponse.body,
        event: llmResponse.event,
        comments: llmResponse.comments
    });

    res.status(200).send('PR review called');
});

export const reviewPr = functions.https.onRequest(app);

async function getAuthenticatedOctokit(installationId: number): Promise<{octokit: Octokit, token: string}> {
    const githubData = (await db.doc('admin/github').get()).data() ?? {};
    const privateKey = fixPrivateKeyFormat(githubData.private_key as string);
    const appId = githubData.app_id as number;

    const authStrategy = createAppAuth({
        appId: appId,
        privateKey: privateKey,
        installationId: installationId,
        clientId: githubData.client_id as string,
        clientSecret: githubData.client_secret as string,
    });

    const authentication = await authStrategy({type: "installation"});

    const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
            installationId: installationId,
            privateKey: privateKey,
            appId: appId,
        }
    });
    await octokit.rest.apps.getAuthenticated();
    return {octokit, token: authentication.token};
}

function fixPrivateKeyFormat(privateKeyData: string) {

	const keyWithouBeginStatement = privateKeyData.replace("-----BEGIN RSA PRIVATE KEY----- ", "");
	const keyWithouEndStatement = keyWithouBeginStatement.replace(" -----END RSA PRIVATE KEY-----", "");
  	const lines = keyWithouEndStatement.split(' ');
  	const formattedPrivateKey = lines.join('\n');

  	const fixedPrivateKey = `-----BEGIN RSA PRIVATE KEY-----\n${formattedPrivateKey}\n-----END RSA PRIVATE KEY-----`;

  	return fixedPrivateKey;
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
    const llmResponse = prReviewLLMResponse(model, version, diffText)
    return llmResponse
}