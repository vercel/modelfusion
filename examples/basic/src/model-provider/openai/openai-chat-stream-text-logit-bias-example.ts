import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText({
    model: openai.ChatTextGenerator({
      model: "gpt-3.5-turbo",
      maxGenerationTokens: 1000,
      logitBias: {
        1820: -100, // 'the'
        279: -100, // ' the'
        264: -100, // ' a'
        64: -100, // 'a'
      },
    }),

    prompt: [
      openai.ChatMessage.system("You are a story writer. Write a story about:"),
      openai.ChatMessage.user("A robot learning to love"),
    ],
  });

  for await (const textChunk of textStream) {
    process.stdout.write(textChunk);
  }
}

main().catch(console.error);
