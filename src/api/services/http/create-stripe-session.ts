import { uid } from "../../../context/auth-context";
import { Product } from "../../models/stripe";
import axios from 'axios';

export async function createStripeSession(
    product: Product
): Promise<any> {
    const successUrl = 'http://localhost:3001/dashboard/subscription';
    const cancelUrl = 'http://localhost:3001/dashboard/repositories';
    const url = 'https://us-central1-pr-review-bot.cloudfunctions.net/stripeCheckout';
    const userId = uid();
    const response = await axios.post(url, {
        product,
        successUrl,
        cancelUrl,
        userId
    });
    
    return response.data;
}