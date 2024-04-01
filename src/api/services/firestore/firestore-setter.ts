import { FirestoreService } from "./firestore-service";

export function setGithubToken(
    token: string | null | undefined
): void {
    const uid = FirestoreService.uid;
    if (uid) {
        FirestoreService.updateDocument('users', uid, { 
            token: token,
            id: uid,
            lastLogin: new Date()
         });
    }
}