import dotenv from "dotenv";
import { mistral, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    mistral
      .ChatTextGenerator({
        model: "mistral-medium",
        maxGenerationTokens: 120,
      })
      .withTextPrompt(),

    "Write a short story about a robot learning to love:"
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
