import { MistralInstructPrompt, ollama, streamText } from "modelfusion";

async function main() {
  const textStream = await streamText(
    ollama
      .CompletionTextGenerator({
        model: "mistral",
        maxGenerationTokens: 500,
        format: "json",
        raw: true, // use prompt template below
      })
      .withTextPromptTemplate(MistralInstructPrompt.text()),

    "Generate 3 character descriptions for a fantasy role playing game. " +
      "Respond using JSON."
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
