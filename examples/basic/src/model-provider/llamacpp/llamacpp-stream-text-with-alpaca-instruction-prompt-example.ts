import { AlpacaPrompt, llamacpp, streamText } from "modelfusion";

// example assumes you are running https://huggingface.co/TheBloke/chronos-13b-v2-GGUF with llama.cpp
async function main() {
  const textStream = await streamText(
    llamacpp
      .CompletionTextGenerator({
        contextWindowSize: 2048, // context window size of Chronos-13B-v2
        maxGenerationTokens: 1024,
      })
      // extra setup to return the optional input from the Alpaca prompt:
      .withPromptTemplate(
        llamacpp.prompt.asLlamaCppPromptTemplate(AlpacaPrompt.instruction())
      ),
    {
      instruction: "You are a celebrated poet. Write a short story about:",
      input: "a robot learning to love.", // Alpaca format supports optional input
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
