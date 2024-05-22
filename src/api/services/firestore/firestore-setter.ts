import { User } from "firebase/auth";
import { uid } from "../../../context/auth-context";
import { FirestoreService } from "./firestore-service";
import { RepositorySettings } from "../../models/repository";

export function setGithubTokenToDB(
    user: User,
    token: string | null | undefined
): void {
    FirestoreService.updateDocument('users', uid(), { 
        token: token,
        user_id: uid(),
        // last_login: new Date(),
        full_name: user.displayName,
        provider: user.providerData,
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

export function setOrganisationSettingsToDB(
    accountId: string,
    type: string,
    settings: RepositorySettings
): void {
    const collection = type === 'User' ? 'users' : 'organisations';
    FirestoreService.updateDocument(collection, `${accountId}`, {
        repository_settings: settings
    });
}

export function setPaymentInProgressInDB() {
    FirestoreService.updateDocument('users', uid(), {
        payment_in_progress: true
    });
}