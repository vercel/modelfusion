import dotenv from "dotenv";
import { generateText, ollama } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
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

  console.log(text);
}

main().catch(console.error);
