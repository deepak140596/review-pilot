
export interface Repository {
    account_id: string;
    account_type: string;
    active: boolean;
    full_name: string;
    id: number;
    installation_id: number;
    name: string;
    private: boolean;
    repository_settings?: RepositorySettings;
}

export interface RepositorySettings {
    high_level_summary: boolean;
    automated_reviews: boolean;
    draft_pull_request_reviews: boolean;
    target_branches: string;
    ignore_title_keywords: string;
}

export const defaultRepositorySettings: RepositorySettings = {
    automated_reviews: false,
    draft_pull_request_reviews: true,
    high_level_summary: false,
    ignore_title_keywords: "",
    target_branches: "",
};
