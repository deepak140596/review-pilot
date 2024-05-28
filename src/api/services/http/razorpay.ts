
import axios from 'axios';
import { uid } from '../../../context/auth-context';

export async function createRazorpaySubscription(data: any): Promise<string> {
    const url = 'https://us-central1-pr-review-bot.cloudfunctions.net/createRazorpaySubscription';
    const response = await axios.post(url, data);
    console.log(`Razorpay subscription id: ${JSON.stringify(response.data)}`)
    return response.data.subscriptionId;
}

export async function cancelRazorpaySubscription() {
    const url = 'https://us-central1-pr-review-bot.cloudfunctions.net/cancelRazorpaySubscription';
    await axios.post(url, { userId: uid(), cancelAtEnd: true });
}