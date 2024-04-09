import Anthropic from '@anthropic-ai/sdk';

const MODEL_NAME = "claude-3-opus-20240229";
const API_KEY = "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";

export async function callClaude(inputText: string) {
    const anthropic = new Anthropic({
        apiKey: API_KEY,
    });

    const result = await anthropic.messages.create({
        model: MODEL_NAME,
        max_tokens: 2048,
        temperature: 0,
        top_k: 1,
        top_p: 1,
        messages: [{ role: "user", content: inputText }],
      });
    const response = result.content[0].text
    const lines: string[] = response.split('\n').slice(1);
    const jsonString: string = lines.join('\n');
    console.log("Claude Response:", jsonString);

    return jsonString;
}