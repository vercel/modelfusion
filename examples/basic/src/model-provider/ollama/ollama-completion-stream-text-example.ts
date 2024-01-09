import { MistralInstructPrompt, ollama, streamText } from "modelfusion";

async function main() {
  const textStream = await streamText(
    ollama
      .CompletionTextGenerator({
        model: "mistral",
        promptTemplate: ollama.prompt.Mistral,
        raw: true, // required when using custom prompt template
        maxGenerationTokens: 500,
      })
      .withTextPrompt(),

    "Write a short story about a robot learning to love:\n\n"
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
