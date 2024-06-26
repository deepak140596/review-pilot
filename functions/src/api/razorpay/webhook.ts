import * as functions from 'firebase-functions';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
const Razorpay = require('razorpay');


try {
    admin.initializeApp();
} catch {}
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));


app.post('/', async (req, res) => {
    const body = req.body;
    await db.collection('razorpay_webhook').add(body);
    const event = body.event;
    const payload = body.payload;
    try {
        const uid = payload.subscription.entity.notes.userId;
        await db.collection('users').doc(uid).update({ payment_in_progress: false })
    } catch (error) {
        console.log('Error: ', error);
    }

    switch (event) {
        case 'subscription.activated':
            console.log('Subscription activated');
            await handleSusbscription(payload, true);
            break;
        case 'subscription.completed':
            console.log('Subscription completed');
            await handleSusbscription(payload, false);
            break;
        case 'subscription.halted':
            console.log('Subscription halted');
            await handleSusbscription(payload, false);
            break;
        case 'subscription.cancelled':
            console.log('Subscription cancelled');
            await handleSusbscription(payload, false);
            break;
        case 'subscription.paused':
            console.log('Subscription paused');
            await handleSusbscription(payload, false);
            break;
        case 'subscription.resumed':
            console.log('Subscription resumed');
            await handleSusbscription(payload, true);
            break;
        default:
            break;
    }
    res.send({ received: true });
})

async function handleSusbscription(payload: any, proState: boolean ) {
    const subscription = payload.subscription.entity;
    const userId = subscription.notes.userId;

    const subscriptionId = subscription.id;
    const planId = subscription.plan_id;
    const razorpayData = (await admin.firestore().doc('admin/razorpay_test').get()).data();
    const razorpay = new Razorpay({
        key_id: razorpayData?.key_id,
        key_secret: razorpayData?.key_secret
    });
    const plan = await razorpay.plans.fetch(planId);

    console.log(`User ID: ${userId}`);
    db.runTransaction(async (transaction) => {
        const user = (await transaction.get(db.doc(`users/${userId}`))).data();
        transaction.set(
            db.doc(`users/${userId}/subscriptions/${subscriptionId}`), 
            { plan, subscription, active: proState }
        );
        if (!user) return;
        const organisations = user.organisations as string[];
        transaction.update(db.doc(`users/${userId}`), { pro: proState });
        if (payload.payment) {
            const payment = payload.payment.entity;
            transaction.update(
                db.doc(`users/${userId}`), 
                { contact: payment.contact, email: payment.email }
            );
        }
        organisations.forEach((orgId) => {
            transaction.update(db.doc(`organisations/${orgId}`), { pro: proState });
        });
    });
    
}

export const razorpayWebhook = functions.https.onRequest(app);