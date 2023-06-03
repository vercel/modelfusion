import { OpenAITextGenerationModel } from "ai-utils.js/model-provider/openai";
import { generateText } from "ai-utils.js/text";

(async () => {
  const model = new OpenAITextGenerationModel({
    apiKey: "invalid-api-key",
    model: "text-davinci-003",
  });

  const generateStory = generateText.asSafeFunction({
    model,
    prompt: async ({ character }: { character: string }) =>
      `Write a short story about ${character} learning to love:\n\n`,
  });

  const abortController = new AbortController();
  abortController.abort(); // this would happen in parallel to generateStory

  const result = await generateStory(
    { character: "a robot" },
    { abortSignal: abortController.signal }
  );

  if (!result.ok) {
    if (result.isAborted) {
      console.error("The story generation was aborted.");
      return;
    }

    console.error(result.error);
    return;
  }

  console.log(result.output);
})();
