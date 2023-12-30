import dotenv from "dotenv";
import {
  TogetherAIApiConfiguration,
  openaicompatible,
  streamText,
} from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    openaicompatible
      .ChatTextGenerator({
        api: new TogetherAIApiConfiguration(),
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      })
      .withTextPrompt(),

    "Write a story about a robot learning to love"
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
