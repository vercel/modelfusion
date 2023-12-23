import dotenv from "dotenv";
import { generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  const { text, finishReason } = await generateText(
    openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      numberOfGenerations: 2,
      maxGenerationTokens: 200,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { fullResponse: true }
  );

  console.log(text);
  console.log();
  console.log("Finish reason:", finishReason);
}

main().catch(console.error);
