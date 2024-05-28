import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import * as express from 'express';
import * as cors from 'cors';
const Razorpay = require('razorpay');

const app = express();
app.use(cors({ origin: true }));

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();

app.post('/', async (req, res) => {
    const { userId } = req.body;
    const razorpayData = (await db.doc('admin/razorpay_test').get()).data();
    const razorpay = new Razorpay({
        key_id: razorpayData?.key_id,
        key_secret: razorpayData?.key_secret
    });

    console.log(`User ID: ${userId}}`)
    const activeSubscriptions = (await db.collection(`users/${userId}/subscriptions`)
        .where('active', '==', true).limit(1).get()).docs;
    
    if (activeSubscriptions.length === 0) {
        console.log('Subscription not found');
        res.status(400).send({ message: 'Subscription not found' });
        return;
    }
    const activeSubscription = activeSubscriptions[0].data();
    const subscriptionId = activeSubscription.subscription.id;
    // const options = {
    //     cancel_at_cycle_end: cancelAtEnd
    // }
    const cancelSubs = await razorpay.subscriptions.cancel(subscriptionId);
    res.send({ cancelSubs });
});

export const cancelRazorpaySubscription = functions.https.onRequest(app);