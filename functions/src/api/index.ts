// /functions/src/api/index.ts
import { webhook } from './github/webhook';
import { payuSubscription  } from './payu/create-subscription';
import { razorpaySubscription } from './razorpay/create-subscription';

export const githubWebhook = webhook;
export const createPayuSubscription = payuSubscription;
export const createRazorpaySubscription = razorpaySubscription;