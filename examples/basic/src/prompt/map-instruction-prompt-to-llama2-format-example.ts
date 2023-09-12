import {
  mapInstructionPromptToLlama2Format,
  LlamaCppTextGenerationModel,
  streamText,
} from "modelfusion";

async function main() {
  // example assumes you are running https://huggingface.co/teleprint-me/llama-2-7b-chat-GGUF with llama.cpp
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      contextWindowSize: 4096, // Llama 2 context window size
      maxCompletionTokens: 512,
    }).withPromptFormat(mapInstructionPromptToLlama2Format()),
    {
      system: "You are a celebrated poet.",
      instruction: "Write a short story about a robot learning to love.",
    }
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
}

main().catch(console.error);
