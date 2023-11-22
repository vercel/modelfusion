import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    openai
      .ChatTextGenerator({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        maxCompletionTokens: 500,
      })
      .withInstructionPrompt(),
    {
      instruction: "Write a short story about a robot learning to love.",
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
