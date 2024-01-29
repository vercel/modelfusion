import dotenv from "dotenv";
import { createInstructionPrompt, openai, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const storyPrompt = createInstructionPrompt(
    async ({ protagonist }: { protagonist: string }) => ({
      system: "You are an award-winning author.",
      instruction: `Write a short story about ${protagonist} learning to love.`,
    })
  );

  const textStream = await streamText({
    model: openai
      .ChatTextGenerator({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        maxGenerationTokens: 500,
      })
      .withInstructionPrompt(),

    prompt: storyPrompt({
      protagonist: "a robot",
    }),
  });

  for await (const textDelta of textStream) {
    process.stdout.write(textDelta);
  }
}

main().catch(console.error);
