import { OpenAITextGenerationModel, generateText } from "ai-utils.js";

(async () => {
  const model = new OpenAITextGenerationModel({
    apiKey: "invalid-api-key",
    model: "text-davinci-003",
  });

  const generateStory = generateText.asFunction({
    model,
    prompt: async ({ character }: { character: string }) =>
      `Write a short story about ${character} learning to love:\n\n`,
  });

  try {
    const abortController = new AbortController();
    abortController.abort(); // this would happen in parallel to generateStory

    const result = await generateStory(
      { character: "a robot" },
      { abortSignal: abortController.signal }
    );

    console.log(result);
  } catch (error) {
    console.log(error);
  }
})();
