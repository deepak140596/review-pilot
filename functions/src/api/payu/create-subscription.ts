import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as crypto from 'crypto';

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();

// Function to create a subscription
app.post('/', async (req, res) => {
    const payuData = (await db.doc('admin/payu').get()).data();
    const PAYU_MERCHANT_KEY = payuData?.merchant_key;
    const PAYU_MERCHANT_SALT = payuData?.merchant_salt_v2;
    const success_url = req.body.success_url;
    const failure_url = req.body.failure_url;

    const { amount, productInfo, firstName, email, phone, planId } = req.body;

    const txnid = Math.random().toString(36).substr(2, 9);
    const postData = {
        key: PAYU_MERCHANT_KEY,
        txnid: txnid,
        amount: amount,
        productinfo: productInfo,
        firstname: firstName,
        email: email,
        phone: phone,
        plan_id: planId,
        surl: success_url,
        furl: failure_url,
        hash: ''
    };

    // Generate hash
    const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productInfo}|${firstName}|${email}|||||||||||${PAYU_MERCHANT_SALT}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    postData.hash = hash;

    res.send(postData);
});

export const payuSubscription = functions.https.onRequest(app);
