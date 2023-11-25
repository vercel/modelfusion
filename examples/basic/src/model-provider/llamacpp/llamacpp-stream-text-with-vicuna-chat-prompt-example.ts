import dotenv from "dotenv";
import { VicunaPromptFormat, llamacpp, streamText } from "modelfusion";

dotenv.config();

// example assumes you are running https://huggingface.co/TheBloke/vicuna-7B-v1.5-GGUF with llama.cpp
async function main() {
  const textStream = await streamText(
    llamacpp
      .TextGenerator({
        contextWindowSize: 2048, // Vicuna v1.5 context window size
        maxCompletionTokens: 512,
      })
      .withTextPromptFormat(VicunaPromptFormat.chat()),
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
