import dotenv from "dotenv";
import { generateText, ollama } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
    ollama
      .CompletionTextGenerator({
        model: "mistral:text",
        maxGenerationTokens: 120,
      })
      .withTextPrompt(),

    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
