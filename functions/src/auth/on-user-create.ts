import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";


try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();


export const onUserCreate = functions.auth.user().onCreate(async (user) => {

    await db.collection('users').doc(user.uid).set({
        created_at: new Date(),
        uid: user.uid,
    });

    return;
});