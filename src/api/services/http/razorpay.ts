
import axios from 'axios';
import { uid } from '../../../context/auth-context';
import { razorpayCancelSubscriptionLink, razorpayCreateSubscriptionLink } from '../../../app-config';

export async function createRazorpaySubscription(data: any): Promise<string> {
    const response = await axios.post(razorpayCreateSubscriptionLink, data);
    console.log(`Razorpay subscription id: ${JSON.stringify(response.data)}`)
    return response.data.subscriptionId;
}

export async function cancelRazorpaySubscription() {
    await axios.post(razorpayCancelSubscriptionLink, { userId: uid(), cancelAtEnd: true });
}