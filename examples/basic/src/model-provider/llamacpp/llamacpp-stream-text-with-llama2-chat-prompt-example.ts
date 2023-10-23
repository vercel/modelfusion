import dotenv from "dotenv";
import {
  LlamaCppTextGenerationModel,
  mapChatPromptToLlama2Format,
  streamText,
} from "modelfusion";

dotenv.config();

async function main() {
  // example assumes you are running https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGML with llama.cpp
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      contextWindowSize: 4096, // Llama 2 context window size
      maxCompletionTokens: 512,
    }).withPromptFormat(mapChatPromptToLlama2Format()),
    [
      { system: "You are a celebrated poet." },
      { user: "Write a short story about a robot learning to love." },
      { ai: "Once upon a time, there was a robot who learned to love." },
      { user: "That's a great start!" },
    ]
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
