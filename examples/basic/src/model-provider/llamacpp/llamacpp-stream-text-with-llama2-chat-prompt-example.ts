import { llamacpp, streamText } from "modelfusion";

async function main() {
  const textStream = await streamText({
    model: llamacpp
      .CompletionTextGenerator({
        // run https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF with llama.cpp
        promptTemplate: llamacpp.prompt.Llama2,
        contextWindowSize: 4096, // Llama 2 context window size
        maxGenerationTokens: 512,
      })
      .withChatPrompt(),

    prompt: {
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
    },
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
