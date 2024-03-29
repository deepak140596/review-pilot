// /functions/src/api/index.ts
import { webhook } from './github/webhook';
import { callback } from './github/callback';

export const githubWebhook = webhook;
export const githubCallback = callback;
