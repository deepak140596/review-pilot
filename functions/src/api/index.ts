// /functions/src/api/index.ts
import { webhook } from './github/webhook';
import { callback } from './github/callback';
import { reviewPr } from './github/review-pr';

export const githubWebhook = webhook;
export const githubCallback = callback;
export const githubReviewPR = reviewPr;