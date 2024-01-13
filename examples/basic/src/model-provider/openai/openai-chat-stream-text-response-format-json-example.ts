import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText({
    model: openai
      .ChatTextGenerator({
        model: "gpt-4-1106-preview",
        responseFormat: { type: "json_object" },
        maxGenerationTokens: 500,
      })
      .withInstructionPrompt(),

    prompt: {
      system: "Generate JSON output.",
      instruction:
        "Generate 3 character for an RPG game. They should have name, class and race attributes.",
    },
  });

  for await (const textChunk of textStream) {
    process.stdout.write(textChunk);
  }
}

main().catch(console.error);
