
export interface LLMConfig {
    versions: LLMVersions,
    activeModel: string,
    prompts: LLMPrompts,
    apiKeys: LLMAPIKeys,
}

interface LLMVersions {
    claude: string;
    gpt4: string;
    gemini: string;
}

interface LLMPrompts {
    claude: string;
    gpt4: string;
    gemini: string;
}

interface LLMAPIKeys {
    claude: string;
    gpt4: string;
    gemini: string;
}