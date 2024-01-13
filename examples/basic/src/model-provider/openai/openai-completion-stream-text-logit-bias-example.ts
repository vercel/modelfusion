import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText({
    model: openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      maxGenerationTokens: 1000,
      logitBias: {
        1169: -100, // 'the'
        262: -100, // ' the'
        257: -100, // ' a'
        64: -100, // 'a'
      },
    }),

    prompt:
      "You are a story writer. Write a story about a robot learning to love",
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
