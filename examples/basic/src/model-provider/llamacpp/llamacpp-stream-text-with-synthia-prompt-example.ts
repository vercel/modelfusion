import { llamacpp, streamText } from "modelfusion";

async function main() {
  const textStream = await streamText(
    llamacpp
      .CompletionTextGenerator({
        // run Synthia-7B-v3.0-GGUF in llama.cpp
        promptTemplate: llamacpp.prompt.Synthia,
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
