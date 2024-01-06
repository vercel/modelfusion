import { MistralInstructPrompt, generateText, ollama } from "modelfusion";

async function main() {
  const text = await generateText(
    ollama
      .CompletionTextGenerator({
        model: "mistral",
        maxGenerationTokens: 120,
        raw: true, // use prompt template below
      })
      .withTextPromptTemplate(MistralInstructPrompt.text()),

    "Write a short story about a robot learning to love."
  );

  console.log(text);
}

main().catch(console.error);
