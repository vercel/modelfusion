import { generateText, ollama } from "modelfusion";

async function main() {
  const text = await generateText({
    model: ollama
      .CompletionTextGenerator({
        model: "mistral",
        promptTemplate: ollama.prompt.Mistral,
        raw: true, // required when using custom prompt template
        maxGenerationTokens: 120,
      })
      .withTextPrompt(),

    prompt: "Write a short story about a robot learning to love.",
  });

  console.log(text);
}

main().catch(console.error);
