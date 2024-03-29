// /functions/src/api/github/webhook.ts
import * as functions from 'firebase-functions';
import * as express from 'express';

const app = express();

app.post('/', (req, res) => {
  const eventType = req.headers['x-github-event'];
  const payload = req.body;

  console.log(`Received GitHub event: ${eventType}`, payload);

  // Here, you'd handle different event types and their payloads
  // For example, if (eventType === 'push') { ... }

  res.status(200).send('Webhook received');
});

export const webhook = functions.https.onRequest(app);
