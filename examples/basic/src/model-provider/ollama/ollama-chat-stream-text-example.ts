import dotenv from "dotenv";
import { ollama, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    ollama.ChatTextGenerator({
      model: "llama2:chat",
      maxGenerationTokens: 500,
    }),
    [
      {
        role: "user",
        content: "Write a short story about a robot learning to love:",
      },
    ]
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
