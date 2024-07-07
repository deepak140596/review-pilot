import { LLMConfig, LLMPrompts } from "../../../models/llm-config";
import { callClaude } from "../llm/callClaude";
import { callGemini } from "../llm/callGemini";
import { callGPT } from "../llm/callGpt";
import * as admin from "firebase-admin";

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();

export async function getPRReviewFromLLM(input: string) {
    const llmConfig = (await db.doc('admin/llm_config').get()).data() as LLMConfig;
    const selectedLLM = llmConfig.activeModel;
    const llmPrompt = (await db.doc(`admin/llm_config/prompts/${selectedLLM}`).get()).data() as LLMPrompts;
    const llmResponse = await prReviewLLMResponse(llmConfig, llmPrompt.prReview, input)
    const formattedResposne = llmResponse.replace(`\`\`\`json`, '').replace(`\`\`\``, '')
    const convertedJSON = JSON.parse(formattedResposne);
    return convertedJSON
}

async function prReviewLLMResponse(llmConfig: LLMConfig, prompt: string, inputDiff: string) {

    const promptWithDiff = `${prompt} ${inputDiff}`
    switch (llmConfig.activeModel) {
        case "gpt4":
            return callGPT(llmConfig.apiKeys.gpt4, llmConfig.versions.gpt4o, promptWithDiff);
        case "claude":
            return callClaude(llmConfig.apiKeys.claude, llmConfig.versions.claude, promptWithDiff);
        case "gemini":
            return callGemini(llmConfig.apiKeys.gemini, llmConfig.versions.gemini, promptWithDiff);
        default:
            throw new Error("Invalid model");
    }
}