import { uid } from "../../../context/auth-context";
import { FirestoreService } from "./firestore-service";

export function setGithubTokenToDB(
    token: string | null | undefined
): void {
    FirestoreService.updateDocument('users', uid, { 
        token: token,
        id: uid,
        lastLogin: new Date()
     });
}