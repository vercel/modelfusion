import dotenv from "dotenv";
import { cohere, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText({
    model: cohere
      .TextGenerator({
        model: "command",
        maxGenerationTokens: 500,
      })
      .withInstructionPrompt(),

    prompt: {
      system: "You are a celebrated poet.",
      instruction: "Write a story about a robot learning to love",
    },
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
