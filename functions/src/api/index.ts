// /functions/src/api/index.ts
import { webhook } from './github/webhook';
import { callback } from './github/callback';
import { checkout } from './stripe/checkout';

export const githubWebhook = webhook;
export const githubCallback = callback;
export const stripeCheckout = checkout;