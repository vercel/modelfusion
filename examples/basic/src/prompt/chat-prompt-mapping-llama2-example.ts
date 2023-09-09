import dotenv from "dotenv";
import {
  Llama2ChatPromptFormat,
  LlamaCppTextGenerationModel,
  streamText,
} from "modelfusion";

dotenv.config();

async function main() {
  // example assumes you are running https://huggingface.co/teleprint-me/llama-2-7b-chat-GGUF with llama.cpp
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      contextWindowSize: 4096, // Llama 2 context window size
      maxCompletionTokens: 512,
    }).withPromptFormat(Llama2ChatPromptFormat()),
    [
      { system: "You are a celebrated poet." },
      { user: "Write a short story about a robot learning to love." },
      { ai: "Once upon a time, there was a robot who learned to love." },
      { user: "That's a great start!" },
    ]
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
}

main().catch(console.error);
