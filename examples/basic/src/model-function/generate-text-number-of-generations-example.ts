import dotenv from "dotenv";
import { generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  const { texts } = await generateText(
    openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      numberOfGenerations: 2,
      maxGenerationTokens: 1000,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { fullResponse: true }
  );

  // multiple generations:
  for (const text of texts) {
    console.log(text);
    console.log();
    console.log();
  }
}

main().catch(console.error);
