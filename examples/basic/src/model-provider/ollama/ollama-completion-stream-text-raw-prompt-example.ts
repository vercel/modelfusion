import dotenv from "dotenv";
import { MistralInstructPrompt, ollama, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    ollama.CompletionTextGenerator({
      model: "mistral:text", // raw mistral model without instruct fine-tuning
      maxGenerationTokens: 500,
    }),
    { prompt: "Write a short story about a robot learning to love:\n\n" }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
