import dotenv from "dotenv";
import { ollama, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    ollama.TextGenerator({
      model: "mistral:text",
      maxCompletionTokens: 500,
    }),
    { prompt: "Write a short story about a robot learning to love:\n\n" }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
