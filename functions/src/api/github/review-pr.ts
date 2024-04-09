import { Octokit } from "octokit";
import * as admin from "firebase-admin";
import * as express from 'express';
import * as functions from 'firebase-functions';
import { createAppAuth } from "@octokit/auth-app";

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();
const app = express();


app.get('/', async (req, res) => {
    const installationId = 49230850;
    const octokit = await getAuthenticatedOctokit(installationId);

    await octokit.rest.issues.create({
        owner: "deepak140596",
        repo: "review-pilot",
        title: "Hello world from octokit",
      });

    res.status(200).send('PR review called');
});

export const reviewPr = functions.https.onRequest(app);

async function getAuthenticatedOctokit(installationId: number): Promise<Octokit> {
    const githubData = (await db.doc('admin/github').get()).data() ?? {};
    const privateKey = fixPrivateKeyFormat(githubData.private_key as string);
    const appId = githubData.app_id as number;
    const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
            installationId: installationId,
            privateKey: privateKey,
            appId: appId,
        }
    });

    const {
        data: { slug },
      } = await octokit.rest.apps.getAuthenticated();

    return octokit;
}

function fixPrivateKeyFormat(privateKeyData: string) {

	const keyWithouBeginStatement = privateKeyData.replace("-----BEGIN RSA PRIVATE KEY----- ", "");
	const keyWithouEndStatement = keyWithouBeginStatement.replace(" -----END RSA PRIVATE KEY-----", "");
  	const lines = keyWithouEndStatement.split(' ');
  	const formattedPrivateKey = lines.join('\n');

  	const fixedPrivateKey = `-----BEGIN RSA PRIVATE KEY-----\n${formattedPrivateKey}\n-----END RSA PRIVATE KEY-----`;

  	return fixedPrivateKey;
}