// /functions/src/api/index.ts
import { webhook } from './github/webhook';
import { payuSubscription  } from './payu/create-subscription';
import { razorpaySubscription } from './razorpay/create-subscription';
import { razorpayWebhook as rpWebhook } from './razorpay/webhook';

export const githubWebhook = webhook;
export const createPayuSubscription = payuSubscription;
export const createRazorpaySubscription = razorpaySubscription;
export const razorpayWebhook = rpWebhook