import Anthropic from '@anthropic-ai/sdk';

export async function callClaude(apiKey: string, version: string, inputText: string) {
    const anthropic = new Anthropic({
        apiKey: apiKey,
    });

    const result = await anthropic.messages.create({
        model: version,
        max_tokens: 2048,
        temperature: 0,
        top_k: 1,
        top_p: 1,
        messages: [{ role: "user", content: inputText }],
      });
    const response = result.content[0].text
    const lines: string[] = response.split('\n').slice(1);
    const jsonString: string = lines.join('\n');
    return jsonString;
}