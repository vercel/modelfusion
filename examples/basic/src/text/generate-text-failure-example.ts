import { OpenAITextGenerationModel } from "ai-utils.js";

(async () => {
  const model = new OpenAITextGenerationModel({
    apiKey: "invalid-api-key",
    model: "text-davinci-003",
    temperature: 0.7,
    maxTokens: 500,
  });

  try {
    const text = await model.generateText(
      "Write a short story about a robot learning to love:\n\n"
    );

    console.log(text);
  } catch (error) {
    console.log(error);
  }
})();
