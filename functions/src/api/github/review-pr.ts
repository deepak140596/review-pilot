import { Octokit } from "octokit";
import * as admin from "firebase-admin";
import * as express from 'express';
import * as functions from 'firebase-functions';
import { createAppAuth } from "@octokit/auth-app";
import { LLM_Model, prReviewLLMResponse } from "../ai/prompts/review-prompt";
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

    const diffText = await getDiff(pullUrl, token);
    const llmResponse = await prReviewLLMResponse(LLM_Model.GEMINI, diffText);
    console.log(llmResponse);

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