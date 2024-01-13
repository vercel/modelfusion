import dotenv from "dotenv";
import { generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  console.log();
  console.log("Logging: basic-text");
  console.log();

  const text = await generateText({
    model: openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      maxGenerationTokens: 50,
    }),
    prompt: "Write a short story about a robot learning to love:\n\n",
    logging: "basic-text",
  });
}

main().catch(console.error);
