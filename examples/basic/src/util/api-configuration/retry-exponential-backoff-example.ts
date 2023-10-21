import {
  OpenAIApiConfiguration,
  OpenAICompletionModel,
  generateText,
  retryWithExponentialBackoff,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const api = new OpenAIApiConfiguration({
    // configure retries as part of the API configuration
    retry: retryWithExponentialBackoff({
      maxTries: 8,
      initialDelayInMs: 1000,
      backoffFactor: 2,
    }),
  });

  const text = await generateText(
    new OpenAICompletionModel({
      model: "gpt-3.5-turbo-instruct",
      api,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
