// /functions/src/api/github/webhook.ts
import * as functions from 'firebase-functions';
import * as express from 'express';
import { event } from 'firebase-functions/v1/analytics';

const app = express();

app.post('/', (req, res) => {
  const eventType = req.headers['x-github-event'];
  const payload = req.body;

  console.log(`Received GitHub event: ${eventType}`);

  if (eventType === 'pull_request') {
    const action = payload.action;
    if (action == "opened") {

    }
  }

  res.status(200).send('Webhook received');
});

export const webhook = functions.https.onRequest(app);
