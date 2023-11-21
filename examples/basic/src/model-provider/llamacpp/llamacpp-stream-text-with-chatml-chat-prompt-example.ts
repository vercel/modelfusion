import dotenv from "dotenv";
import {
  ChatMLPromptFormat,
  LlamaCppTextGenerationModel,
  streamText,
} from "modelfusion";

dotenv.config();

// example assumes you are running https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF with llama.cpp
async function main() {
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      contextWindowSize: 4096,
      maxCompletionTokens: 512,
    }).withTextPromptFormat(ChatMLPromptFormat.chat()),
    {
      system: "You are a celebrated poet.",
      messages: [
        {
          role: "user",
          content: "Suggest a name for a robot.",
        },
        {
          role: "assistant",
          content: "I suggest the name Robbie",
        },
        {
          role: "user",
          content: "Write a short story about Robbie learning to love",
        },
      ],
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
