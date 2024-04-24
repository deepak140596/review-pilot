import * as functions from 'firebase-functions';
import * as express from 'express';
import { reviewPR } from './review-pr';
import { handleCommands } from './handle-commands';
import { getAuthenticatedOctokit } from './octokit';
import * as admin from "firebase-admin";

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();

const app = express();

app.post('/', async (req, res) => {
  const eventType = req.headers['x-github-event'];
  const payload = req.body;
  const action = payload.action;
  var response;

  const { octokit, token } = await getAuthenticatedOctokit(req);

  switch (eventType) {
    case 'pull_request':
      if (action == "opened" || action == "reopened") {
        response = await reviewPR(req, octokit, token);
      }
      break;
    case 'issue_comment':
      if (action == 'created') {
        response = await handleCommands(req, octokit, token);
      }
      break;
    case 'installation':
      if (action == 'created') {
        console.log('Installation created');
        await processInstallationCreatedEvent(payload);
      } else if (payload.action == 'deleted') {
        console.log('Installation deleted');
        await processInstallationDeletedEvent(payload);
      }
      break;
    case 'installation_repositories':
      if (action == 'added') {
        console.log('Installation added');
        await processRepositoriesAddedEvent(payload);
      } else if (action == 'removed') {
        console.log('Installation removed');
        await processRepositoriesRemovedEvent(payload);
      }
      break;
    default:
        response = { message: 'No action taken' };
  }

  if (!response) {
    response = { message: 'No action taken' };
  }
  res.status(200).send(response);
});

const runtimeOptions = {
  timeoutSeconds: 300,
  memory: '256MB' as const
}
export const webhook = functions.runWith(runtimeOptions).https.onRequest(app);

async function processInstallationCreatedEvent(payload: any) {
  const account = payload.installation.account;
  const installationId: number = payload.installation.id;
  const accountType: string = account.type; // User or Organization
  const accountLogin: string = account.login;
  const repositories: any[] = payload.repositories;
  const sender = payload.sender;

  var batch = db.batch();
  var batchCount = 0;

  repositories.forEach(async (repo) => {
    repo.account_id = accountLogin;
    repo.installation_id = installationId;
    repo.account_type = accountType;
    repo.active = true;

    const docRef = db.collection('repositories').doc(repo.id.toString());
    batch.set(docRef, repo);
    batchCount++;

    if (batchCount % 499 === 0) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  });

  await batch.commit();
  batch = db.batch();
  
  account.installation_id = installationId;
  if (accountType === 'Organization') {
    sender.organisations = admin.firestore.FieldValue.arrayUnion(accountLogin);
    account.users = admin.firestore.FieldValue.arrayUnion(sender.login);
    batch.set(db.collection('organisations').doc(accountLogin), account);
  }

  const userId = (await db.collection('users').where('login', '==', sender.login).get()).docs;
  console.log(`User ID: ${userId}`);
  if (userId && userId.length > 0) {
    const uid = userId[0].id;
    batch.set(db.collection('users').doc(uid), sender, { merge: true });
  }
  await batch.commit();
}

async function processInstallationDeletedEvent(payload: any) {
  const deletedRepositories: any[] = payload.repositories;

  var batch = db.batch();
  var batchCount = 0;
  deletedRepositories.forEach(async (repo) => {
    const docRef = db.collection('repositories').doc(repo.id.toString());
    batch.update(docRef, { active: false });
    batchCount++;
    if (batchCount % 499 === 0) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  });

  await batch.commit();
}

async function processRepositoriesAddedEvent(payload: any) {
  const addedRepositories: any[] = payload.repositories_added;

  var batch = db.batch();
  var batchCount = 0;
  addedRepositories.forEach(async (repo) => {
    const docRef = db.collection('repositories').doc(repo.id.toString());
    batch.set(docRef, repo);
    batchCount++;
    if (batchCount % 499 === 0) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  });

  await batch.commit();
}

async function processRepositoriesRemovedEvent(payload: any) {
  const removedRepositories: any[] = payload.repositories_removed;

  var batch = db.batch();
  var batchCount = 0;
  removedRepositories.forEach(async (repo) => {
    const docRef = db.collection('repositories').doc(repo.id.toString());
    batch.delete(docRef);
    batchCount++;
    if (batchCount % 499 === 0) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  });

  await batch.commit();
}