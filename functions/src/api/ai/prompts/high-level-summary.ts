import { LLMConfig, LLMPrompts } from "../../../models/llm-config";
import { callClaude } from "../llm/callClaude";
import { callGemini } from "../llm/callGemini";
import { callGPT } from "../llm/callGpt";
import * as admin from "firebase-admin";

try {
    admin.initializeApp();
} catch{}
const db = admin.firestore();

export async function getHighLevelSummaryFromLLM(input: string) {
    const llmConfig = (await db.doc('admin/llm_config').get()).data() as LLMConfig;
    const selectedLLM = llmConfig.activeModel;
    const llmPrompt = (await db.doc(`admin/llm_config/prompts/${selectedLLM}`).get()).data() as LLMPrompts;
    const llmResponse = await summaryLLMResponse(llmConfig, llmPrompt.highLevelSummary, input)
    const formattedResposne = llmResponse.replace(`\`\`\`json`, '').replace(`\`\`\``, '')
    const convertedJSON = JSON.parse(formattedResposne);
    return convertedJSON
}

async function summaryLLMResponse(llmConfig: LLMConfig, prompt: string, inputDiff: string) {

    const promptWithDiff = `${prompt} ${inputDiff}`
    switch (llmConfig.activeModel) {
        case "gpt4":
            return callGPT(llmConfig.apiKeys.gpt4, llmConfig.versions.gpt3, promptWithDiff);
        case "claude":
            return callClaude(llmConfig.apiKeys.claude, llmConfig.versions.claude, promptWithDiff);
        case "gemini":
            return callGemini(llmConfig.apiKeys.gemini, llmConfig.versions.gemini, promptWithDiff);
        default:
            throw new Error("Invalid model");
    }
}

/**
 * Example output 

<!-- This is an auto-generated comment: release notes by coderabbit.ai -->
## Summary by CodeRabbit

- **Style**
	- Adjusted layout structure and styling in the login page.
	- Added padding property with the value `auto` in the logo component's SCSS file.
	- Refactored the `Login` component to separate content into two functions.
	- Updated image paths constant in the `images.ts` file.
- **Bug Fixes**
	- Corrected a typo in the import statement for the `Trial` component in the `buy.tsx` file.
- **Chores**
	- Updated the `.gitignore` file to include `src/api/services/firestore/firebase-config.ts`.
- **Refactor**
	- Imported `firebaseConfig` from a separate file in the `firestore-service.ts` file.
- **New Features**
	- Added a function `handleGithubRepoClick` to handle clicking on a GitHub link in the footer component.
<!-- end of auto-generated comment: release notes by coderabbit.ai -->

 */