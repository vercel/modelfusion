import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const { textStream, text, metadata } = await streamText({
    model: openai
      .CompletionTextGenerator({
        model: "gpt-3.5-turbo-instruct",
        maxGenerationTokens: 500,
      })
      .withInstructionPrompt(),

    prompt: { instruction: "Write a story about a robot learning to love" },
    fullResponse: true,
  });

  console.log("\n\nMETADATA:");
  console.log(JSON.stringify(metadata));

  console.log("\n\nCONTENT:");
  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }

  console.log("\n\nTEXT:");
  console.log(await text); // available once stream is finished
}

main().catch(console.error);
