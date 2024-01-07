import { llamacpp, streamText } from "modelfusion";

// example assumes you are running a mistral instruct model with llama.cpp
async function main() {
  const textStream = await streamText(
    llamacpp
      .CompletionTextGenerator({
        promptTemplate: llamacpp.prompt.Mistral,
        maxGenerationTokens: 512,
      })
      .withInstructionPrompt(),

    {
      system: "You are a celebrated poet.",
      instruction: "Write a short story about a robot learning to love.",
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
