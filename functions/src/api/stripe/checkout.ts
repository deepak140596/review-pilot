import * as functions from 'firebase-functions';
import * as express from 'express';
import * as admin from "firebase-admin";

try {
    admin.initializeApp();
} catch{}

const app = express();

app.post('/', async (req, res) => {
    const { product, successUrl, cancelUrl  } = req.body;
    console.log(`Product: ${product}, successUrl: ${successUrl}, cancelUrl: ${cancelUrl}`);
    const stripeData = (await admin.firestore().collection('admin').doc('stripe_test').get()).data();

    const stripe = require('stripe')(stripeData?.secret_key);
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [
                {
                    price: product.price_id,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
        console.log(`Session id: ${session.id}`)
        res.status(200).send({ sessionId: session.id });
    } catch (error) {
        res.status(500).send({ error: "Error creating session id" });
    }
});

export const checkout = functions.https.onRequest(app);