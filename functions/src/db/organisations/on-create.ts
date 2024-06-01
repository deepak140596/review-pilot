
import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";


try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();


export const onOrganisationCreate = functions.firestore
.document('organisations/{organisationId}')
.onCreate(async (snapshot, context) => {
    const organisationId = context.params.organisationId;
    await db.collection('organisations').doc(organisationId).set({
        created_at: new Date(),
        uid: organisationId,
    });
    return;
});