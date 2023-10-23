import { LlamaCppTextGenerationModel, streamText } from "modelfusion";

async function main() {
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      maxCompletionTokens: 1024,
      temperature: 0.7,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
