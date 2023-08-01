import {
  OpenAITextGenerationModel,
  generateText,
  retryWithExponentialBackoff,
} from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const { text } = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      temperature: 0.7,
      maxTokens: 500,
      retry: retryWithExponentialBackoff({
        maxTries: 8,
        initialDelayInMs: 1000,
        backoffFactor: 2,
      }),
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
