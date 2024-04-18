import { LLMConfig } from "../../../models/llm_config";
import { callClaude } from "../llm/callClaude";
import { callGemini } from "../llm/callGemini";
import { callGPT } from "../llm/callGpt";
import * as admin from "firebase-admin";

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();

export async function getLLMResponse(input: string) {
    const llmConfig = (await db.doc('admin/llm_config').get()).data() as LLMConfig;
    const model = llmConfig.activeModel;
    console.log(`active model: ${model}`)
    const llmResponse = await prReviewLLMResponse(llmConfig, input)
    const convertedJSON = JSON.parse(llmResponse);
    return convertedJSON
}

async function prReviewLLMResponse(llmConfig: LLMConfig, inputDiff: string) {

    switch (llmConfig.activeModel) {
        case "gpt4":
            const prompt = `${llmConfig.prompts.gpt4} ${inputDiff}`
            return callGPT(llmConfig.apiKeys.gpt4, llmConfig.versions.gpt4, prompt);
        case "claude":
            const promptClaude = `${llmConfig.prompts.claude} ${inputDiff}`
            return callClaude(llmConfig.apiKeys.claude, llmConfig.versions.claude, promptClaude);
        case "gemini":
            const promptGemini = `${llmConfig.prompts.gemini} ${inputDiff}`
            return callGemini(llmConfig.apiKeys.gemini, llmConfig.versions.gemini, promptGemini);
        default:
            throw new Error("Invalid model");
    }
}