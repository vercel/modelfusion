import { ollama, streamText } from "modelfusion";

async function main() {
  const textStream = await streamText(
    ollama
      .ChatTextGenerator({
        model: "llama2:chat",
        maxGenerationTokens: 500,
      })
      .withTextPrompt(),

    "Write a short story about a robot learning to love:"
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
