import dotenv from "dotenv";
import { ollama, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    ollama
      .TextGenerator({
        model: "mistral",
        maxGenerationTokens: 500,
        format: "json",
      })
      .withTextPrompt(),

    "Generate 3 character descriptions for a fantasy role playing game. " +
      "Respond using JSON."
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
