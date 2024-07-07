
export interface LLMConfig {
    versions: LLMVersions,
    activeModel: string,
    apiKeys: LLMAPIKeys,
}

interface LLMVersions {
    claude: string;
    gpt4: string;
    gemini: string;
}

export interface LLMPrompts {
    prReview: string;
    highLevelSummary: string;
}

interface LLMAPIKeys {
    claude: string;
    gpt4: string;
    gemini: string;
}