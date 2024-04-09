const OpenAI = require("openai");

const API_KEY = "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";
const MODEL_NAME = "gpt-4-0125-preview";

export async function callGPT(inputText: string) {
  const openai = new OpenAI({
    apiKey: API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
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
    console.log("GPT-4 Response:", text);
    return text;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
