const OpenAI = require("openai");

export async function callGPT(apiKey: string, version: string, inputText: string) {
  const openai = new OpenAI({
    apiKey: apiKey,
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
