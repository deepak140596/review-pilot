import axios from 'axios';

export async function createPayuSubscription(data: any) {
    const url = 'https://us-central1-pr-review-bot.cloudfunctions.net/createPayuSubscription';
    

    const response = await axios.post(url, data);
    console.log(`Payu res data: ${JSON.stringify(response.data)}`)
    return response.data;
}