import { RepositorySettings } from "./repository";

export interface Account {
    avatar_url: string;
    id: number;
    type: string;
    uid: string;
    full_name?: string;
    repository_settings?: RepositorySettings;
    login?: string;
}