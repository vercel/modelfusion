import {
  Llama2PromptFormat,
  LlamaCppTextGenerationModel,
  streamText,
} from "modelfusion";

async function main() {
  // example assumes you are running https://huggingface.co/TheBloke/Llama-2-7B-GGUF with llama.cpp
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      contextWindowSize: 4096, // Llama 2 context window size
      maxCompletionTokens: 512,
    })
      .withTextPrompt()
      .withPromptFormat(Llama2PromptFormat.instruction()),
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
