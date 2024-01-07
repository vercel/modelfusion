import { llamacpp, streamText } from "modelfusion";

async function main() {
  const textStream = await streamText(
    llamacpp
      .CompletionTextGenerator({
        // run https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF with llama.cpp
        promptTemplate: llamacpp.prompt.ChatML,
        contextWindowSize: 4096,
        maxGenerationTokens: 512,
      })
      .withChatPrompt(),

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
