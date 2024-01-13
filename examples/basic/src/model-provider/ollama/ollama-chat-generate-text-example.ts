import { generateText, ollama } from "modelfusion";

async function main() {
  const text = await generateText({
    model: ollama.ChatTextGenerator({
      model: "llama2:chat",
      maxGenerationTokens: 500,
    }),

    prompt: [
      {
        role: "user",
        content: "Write a short story about a robot learning to love:",
      },
    ],
  });

  console.log(text);
}

main().catch(console.error);
