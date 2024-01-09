import { MistralInstructPrompt, ollama, streamText } from "modelfusion";

async function main() {
  const textStream = await streamText(
    ollama
      .CompletionTextGenerator({
        model: "mistral",
        promptTemplate: ollama.prompt.Mistral,
        raw: true, // required when using custom prompt template
        maxGenerationTokens: 500,
        format: "json",
      })
      .withTextPrompt(),

    "Generate 3 character descriptions for a fantasy role playing game. " +
      "Respond using JSON."
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
