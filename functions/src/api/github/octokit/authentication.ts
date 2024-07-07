import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "octokit";
import * as admin from "firebase-admin";
import * as express from 'express';

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();

export async function getAuthenticatedOctokit(req: express.Request): Promise<{octokit: Octokit, token: string}> {
    const installationId = req.body.installation.id as number;
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