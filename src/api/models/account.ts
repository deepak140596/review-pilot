import { RepositorySettings } from "./repository";

export interface Account {
    avatar_url: string;
    id: number;
    type: string;
    uid: string;
    full_name?: string;
    repository_settings?: RepositorySettings;
    login?: string;
    email?: string;
    pro?: boolean;
    contact?: string;
    payment_in_progress?: boolean;
    created_at?: Date;
}

export function trialDays(account: Account): number {
    if (!account.created_at) {
        return 0;
    }
    const now = new Date();
    const diff = now.getTime() - account.created_at.getTime();
    const diffDays = (diff / (1000 * 3600 * 24));
    return TRIAL_DAYS - diffDays;
}

export const TRIAL_DAYS = 30;