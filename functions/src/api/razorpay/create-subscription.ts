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
    const { planId, userId } = req.body;
    const razorpayData = (await db.doc('admin/razorpay_test').get()).data();
    const razorpay = new Razorpay({
        key_id: razorpayData?.key_id,
        key_secret: razorpayData?.key_secret
    });

    const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12,
        notes: {
            userId
        }
    });

    res.send({ subscriptionId: subscription.id });
})

export const razorpaySubscription = functions.https.onRequest(app);