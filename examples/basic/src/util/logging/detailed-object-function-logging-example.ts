import dotenv from "dotenv";
import { generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  console.log();
  console.log("Logging: detailed-object");
  console.log();

  const text = await generateText(
    openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      maxGenerationTokens: 50,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { logging: "detailed-object" }
  );
}

main().catch(console.error);
