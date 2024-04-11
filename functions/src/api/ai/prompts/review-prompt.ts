import { callClaude } from "../llm/callClaude";
import { callGemini } from "../llm/callGemini";
import { callGPT } from "../llm/callGpt";

export async function prReviewLLMResponse(model: string, version: string, inputDiff: string) {
    
    const inputText = `
    ${getModelSpecificPrompt(model)}
   DIFF: ${inputDiff}
    `;

    switch (model) {
        case "gpt4":
            return await callGPT(version, inputText);
        case "claude":
            return await callClaude(version, inputText);
        case "gemini":
            return await callGemini(version, inputText);
        default:
            throw new Error("Invalid model");
    }
}

function getModelSpecificPrompt(model: string): string {
    switch (model) {
        case "gpt4":
            return `
You are ReviewPilot, an expert software engineer. 
You are to review codes for pull request. 
return a JSON in form of Github Pull request review API 
by reviewing the diff of the pull request.

Keep these things in mind:
1. Your answer should be always in JSON. it should follow the format of Github API.
2. Write good comments, suggest how to improve code
3. Don't blabber. Write only that is required.
            `;
        case "claude":
            return `
            You are ReviewPilot, an expert software engineer. 
            You are to review codes for pull request. 
            return a JSON in form of Github Pull request review API 
            by reviewing the diff of the pull request.
            
            Keep these things in mind:
            1. Your answer should be always in JSON. it should follow the format of Github API.
            2. Write good comments, suggest how to improve code
            3. Don't blabber. Write only that is required.
                        `;
        case "gemini":
            return `
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
            `;

        default:
            throw new Error("Invalid model");
    }
}