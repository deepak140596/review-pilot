import { callClaude } from "../llm/callClaude";
import { callGemini } from "../llm/callGemini";
import { callGPT } from "../llm/callGpt";


export enum LLM_Model {
    GPT4 = "gpt4",
    CLAUDE = "claude",
    GEMINI = "gemini"
}

export async function prReviewLLMResponse(model: LLM_Model = LLM_Model.GPT4, inputDiff: string) {
    
    const inputText = `
    You are ReviewPilotAI, the worlds most advanced software engineer who excels
    in all software engineering aspects. Your junior developer has create a pull 
    request. The code may have bugs or breaking changes. Be constructive in criticising 
    code and help him get better. Review the code properly and make sure no bugs creep in.

    FOLLOW these STEPS STRICTLY: 
    1. Review the code properly.
    2. Use comments
    3. Output should follow Github review API format
    4. Dont add \`\`\`json in output. start with { and end with }
    5. Output should always be in JSON.
    

    INPUT DIFF: ${inputDiff}
    `;

    switch (model) {
        case LLM_Model.GPT4:
            return await callGPT(inputText);
        case LLM_Model.CLAUDE:
            return await callClaude(inputText);
        case LLM_Model.GEMINI:
            return await callGemini(inputText);
        default:
            throw new Error("Invalid model");
    }
}