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
    processOutput: async (output: string) => output.trim(),
  });

  try {
    const result = await generateStory({ character: "a robot" });

    console.log(result);
  } catch (error) {
    console.log(error);
  }
})();
