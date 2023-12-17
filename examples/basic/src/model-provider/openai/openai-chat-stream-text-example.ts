import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    openai.ChatTextGenerator({
      model: "gpt-3.5-turbo",
      maxGenerationTokens: 1000,
    }),
    [
      openai.ChatMessage.system("You are a story writer. Write a story about:"),
      openai.ChatMessage.user("A robot learning to love"),
    ]
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
