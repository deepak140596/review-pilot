// /functions/src/api/github/callback.ts
import * as functions from 'firebase-functions';
import * as express from 'express';

const app = express();

app.get('/', (req, res) => {
  const code = req.query.code;
  
  console.log(`Received GitHub OAuth code: ${code}`);

  // Here, you'd exchange the code for an access token and proceed with the OAuth flow
  // This often involves a server-side request to GitHub's OAuth token exchange endpoint

  res.status(200).send('OAuth callback received');
});

export const callback = functions.https.onRequest(app);
