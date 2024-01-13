import dotenv from "dotenv";
import { generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  console.log();
  console.log("Logging: detailed-json");
  console.log();

  const text = await generateText({
    model: openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      maxGenerationTokens: 50,
    }),
    prompt: "Write a short story about a robot learning to love:\n\n",
    logging: "detailed-json",
  });
}

main().catch(console.error);
