
import axios from 'axios';

export async function createRazorpaySubscription(data: any) {
    const url = 'https://us-central1-pr-review-bot.cloudfunctions.net/createRazorpaySubscription';
    const response = await axios.post(url, data);
    console.log(`Razorpay subscription id: ${JSON.stringify(response.data)}`)
    return response.data;
}