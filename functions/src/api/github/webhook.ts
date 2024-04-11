// /functions/src/api/github/webhook.ts
import * as functions from 'firebase-functions';
import * as express from 'express';
import { reviewPR } from './review-pr';

const app = express();

app.post('/', async (req, res) => {
  const eventType = req.headers['x-github-event'];
  const payload = req.body;
  var response;

  console.log(`Received GitHub event: ${eventType}`);

  if (eventType === 'pull_request') {
    const action = payload.action;
    if (action == "opened" || action == "reopened" || action == "synchronize") {
      response = await reviewPR(req);
    }
  }

  if (!response) {
    response = { message: 'No action taken' };
  }
  res.status(200).send(response);
});

export const webhook = functions.https.onRequest(app);
