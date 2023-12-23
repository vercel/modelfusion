import dotenv from "dotenv";
import { generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  const { text, finishReason } = await generateText(
    openai
      .ChatTextGenerator({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        maxGenerationTokens: 200,
      })
      .withTextPrompt(),
    "Write a short story about a robot learning to love:",
    { fullResponse: true }
  );

  console.log(text);
  console.log();
  console.log("Finish reason:", finishReason);
}

main().catch(console.error);
