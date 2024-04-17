
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

"claude-3-opus-20240229"
"gemini-1.0-pro"
"gpt-4-turbo"