import { User } from "firebase/auth";
import { uid } from "../../../context/auth-context";
import { FirestoreService } from "./firestore-service";
import { RepositorySettings } from "../../models/repository";

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

export function setRepositorySettingsToDB(
    repositoryId: number,
    settings: RepositorySettings
): void {
    FirestoreService.updateDocument('repositories', `${repositoryId}`, {
        repository_settings: settings
    });
}