import { llamacpp, streamText } from "modelfusion";

async function main() {
  const textStream = await streamText({
    model: llamacpp
      .CompletionTextGenerator({
        // run https://huggingface.co/TheBloke/Llama-2-7B-GGUF with llama.cpp
        promptTemplate: llamacpp.prompt.Llama2,
        contextWindowSize: 4096, // Llama 2 context window size
        maxGenerationTokens: 512,
      })
      .withTextPrompt(),

    prompt: "Write a short story about a robot learning to love.",
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
