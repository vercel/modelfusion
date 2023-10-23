import dotenv from "dotenv";
import {
  LlamaCppTextGenerationModel,
  mapChatPromptToVicunaFormat,
  streamText,
} from "modelfusion";

dotenv.config();

async function main() {
  // example assumes you are running https://huggingface.co/TheBloke/vicuna-7B-v1.5-GGML with llama.cpp
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      contextWindowSize: 2048, // Vicuna v1.5 context window size
      maxCompletionTokens: 512,
    }).withPromptFormat(mapChatPromptToVicunaFormat()),
    [
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
