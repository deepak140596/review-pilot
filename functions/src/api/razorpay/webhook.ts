import * as functions from 'firebase-functions';
import * as express from 'express';
import * as admin from 'firebase-admin';

try {
    admin.initializeApp();
} catch {}
const db = admin.firestore();
const app = express();

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

    console.log(`User ID: ${userId}`);
    db.runTransaction(async (transaction) => {
        const user = (await transaction.get(db.doc(`users/${userId}`))).data();
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