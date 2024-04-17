import * as functions from 'firebase-functions';
import * as express from 'express';
import { reviewPR } from './review-pr';
import { handleCommands } from './handle-commands';
import { getAuthenticatedOctokit } from './octokit';

const app = express();

app.post('/', async (req, res) => {
  const eventType = req.headers['x-github-event'];
  const payload = req.body;
  var response;

  const { octokit, token } = await getAuthenticatedOctokit(req);

  if (eventType === 'pull_request') {
    const action = payload.action;
    if (action == "opened" || action == "reopened") {
      response = await reviewPR(req, octokit, token);
    }
  } else if (eventType === 'issue_comment') {
    if (payload.action == 'created') {
      response = await handleCommands(req, octokit, token);
    }
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
