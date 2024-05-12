import * as admin from "firebase-admin";

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();

export async function processInstallationCreatedEvent(payload: any) {
    const account = payload.installation.account;
    const installationId: number = payload.installation.id;
    const accountType: string = account.type; // User or Organization
    const accountLogin: string = account.login;
    const accountId: string = account.id;
    const repositories: any[] = payload.repositories;
    const sender = payload.sender;
  
    var batch = db.batch();
    var batchCount = 0;
  
    repositories.forEach(async (repo) => {
      repo.account_id = accountId;
      repo.account_login = accountLogin;
      repo.installation_id = installationId;
      repo.account_type = accountType;
      repo.active = true;
  
      const docRef = db.collection('repositories').doc(repo.id.toString());
      batch.set(docRef, repo);
      batchCount++;
  
      if (batchCount % 499 === 0) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    });
  
    await batch.commit();
    batch = db.batch();
    
    account.installation_id = installationId;
    if (accountType === 'Organization') {
      sender.organisations = admin.firestore.FieldValue.arrayUnion(accountLogin);
      account.users = admin.firestore.FieldValue.arrayUnion(sender.id);
      batch.set(db.collection('organisations').doc(accountLogin), account);
    }
  
    const userId = (await db.collection('users').where('id', '==', sender.id).get()).docs;
    console.log(`User ID: ${userId}`);
    if (userId && userId.length > 0) {
      const uid = userId[0].id;
      batch.set(db.collection('users').doc(uid), sender, { merge: true });
    }
    await batch.commit();
  }
  
export async function processInstallationDeletedEvent(payload: any) {
    const deletedRepositories: any[] = payload.repositories;
  
    var batch = db.batch();
    var batchCount = 0;
    deletedRepositories.forEach(async (repo) => {
      const docRef = db.collection('repositories').doc(repo.id.toString());
      batch.update(docRef, { active: false });
      batchCount++;
      if (batchCount % 499 === 0) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    });
  
    await batch.commit();
  }
  
export async function processRepositoriesAddedEvent(payload: any) {
    const addedRepositories: any[] = payload.repositories_added;
    const account = payload.installation.account;
    const installationId: number = payload.installation.id;
    const accountType: string = account.type; // User or Organization
    const accountLogin: string = account.login;
    const accountId: string = account.id;
  
    var batch = db.batch();
    var batchCount = 0;
    addedRepositories.forEach(async (repo) => {
      repo.account_id = accountId;
      repo.account_login = accountLogin;
      repo.installation_id = installationId;
      repo.account_type = accountType;
      repo.active = true;
  
      const docRef = db.collection('repositories').doc(repo.id.toString());
      batch.set(docRef, repo);
      batchCount++;
      if (batchCount % 499 === 0) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    });
  
    await batch.commit();
  }
  
export async function processRepositoriesRemovedEvent(payload: any) {
    const removedRepositories: any[] = payload.repositories_removed;
  
    var batch = db.batch();
    var batchCount = 0;
    removedRepositories.forEach(async (repo) => {
      const docRef = db.collection('repositories').doc(repo.id.toString());
      batch.update(docRef, { active: false });
      batchCount++;
      if (batchCount % 499 === 0) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    });
  
    await batch.commit();
  }