const OpenAI = require("openai");

const API_KEY = "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";

export async function callGPT(version: string, inputText: string) {
  const openai = new OpenAI({
    apiKey: API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: version,
      response_format: { "type": "json_object" },
      messages: [
        {
          role: "user",
          content: inputText,
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    });

    const text = response.choices[0].message.content;
    return text;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
