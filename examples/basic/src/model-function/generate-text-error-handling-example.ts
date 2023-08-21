import { OpenAITextGenerationModel, generateText } from "modelfusion";

(async () => {
  try {
    const text = await generateText(
      new OpenAITextGenerationModel({
        apiKey: "invalid-api-key",
        model: "text-davinci-003",
        temperature: 0.7,
        maxCompletionTokens: 500,
      }),
      "Write a short story about a robot learning to love:\n\n"
    );

    console.log(text);
  } catch (error) {
    console.log(error);
  }
})();
