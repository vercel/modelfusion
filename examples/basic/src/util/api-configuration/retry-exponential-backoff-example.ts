import dotenv from "dotenv";
import { generateText, openai, api } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText({
    model: openai.CompletionTextGenerator({
      api: openai.Api({
        // configure retries as part of the API configuration
        retry: api.retryWithExponentialBackoff({
          maxTries: 8,
          initialDelayInMs: 1000,
          backoffFactor: 2,
        }),
      }),
      model: "gpt-3.5-turbo-instruct",
    }),
    prompt: "Write a short story about a robot learning to love:\n\n",
  });

  console.log(text);
}

main().catch(console.error);
