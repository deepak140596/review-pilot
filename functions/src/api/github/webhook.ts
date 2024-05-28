import * as functions from 'firebase-functions';
import * as express from 'express';
import { reviewPR } from './actions/review-pr';
import { handleCommands } from './actions/handle-commands';
import { getAuthenticatedOctokit } from './octokit';
import { processInstallationCreatedEvent, processInstallationDeletedEvent, processRepositoriesAddedEvent, processRepositoriesRemovedEvent } from './actions/repo-updates';

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
      }git
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