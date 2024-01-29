import dotenv from "dotenv";
import { createTextPrompt, openai, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const storyPrompt = createTextPrompt(
    async ({ protagonist }: { protagonist: string }) =>
      `Write a short story about ${protagonist} learning to love:\n\n`
  );

  const textStream = await streamText({
    model: openai
      .ChatTextGenerator({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        maxGenerationTokens: 500,
      })
      .withTextPrompt(),

    prompt: storyPrompt({
      protagonist: "a robot",
    }),
  });

  for await (const textDelta of textStream) {
    process.stdout.write(textDelta);
  }
}

main().catch(console.error);
