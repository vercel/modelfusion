import {
  OpenAIApiConfiguration,
  OpenAITextGenerationModel,
  generateText,
  retryWithExponentialBackoff,
  throttleUnlimitedConcurrency,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const text = await generateText(
    new OpenAITextGenerationModel({
      model: "gpt-3.5-turbo-instruct",
      api: new OpenAIApiConfiguration({
        // all parameters are optional:
        apiKey: "my-api-key",
        baseUrl: "custom-base-url",
        retry: retryWithExponentialBackoff({ maxTries: 5 }),
        throttle: throttleUnlimitedConcurrency(),
      }),
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
