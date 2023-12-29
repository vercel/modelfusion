import dotenv from "dotenv";
import { MistralInstructPrompt, ollama, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    ollama
      .CompletionTextGenerator({
        model: "mistral",
        maxGenerationTokens: 500,
        raw: true, // use prompt template below
      })
      .withTextPromptTemplate(MistralInstructPrompt.text()),

    "Write a short story about a robot learning to love:\n\n"
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
