import { OpenAITextGenerationModel } from "ai-utils.js/provider/openai";
import { generateText } from "ai-utils.js/text";
import { retryWithExponentialBackoff } from "ai-utils.js/util";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const model = new OpenAITextGenerationModel({
    apiKey: OPENAI_API_KEY,
    model: "text-davinci-003",
  });

  const generateStory = generateText.asFunction({
    model,
    prompt: async ({ character }: { character: string }) =>
      `Write a short story about ${character} learning to love:\n\n`,

    retry: retryWithExponentialBackoff({
      maxTries: 3,
      initialDelay: 5000,
      backoffFactor: 4,
    }),
  });

  const text = await generateStory({ character: "a robot" });

  console.log(text);
})();
