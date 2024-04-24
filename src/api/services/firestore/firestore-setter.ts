import { User } from "firebase/auth";
import { uid } from "../../../context/auth-context";
import { FirestoreService } from "./firestore-service";

export function setGithubTokenToDB(
    user: User,
    token: string | null | undefined
): void {
    FirestoreService.updateDocument('users', uid, { 
        token: token,
        user_id: uid,
        last_login: new Date(),
        login: user.displayName,
     });
}