import { generateText, llamacpp } from "modelfusion";

async function main() {
  const text = await generateText({
    model: llamacpp.CompletionTextGenerator({
      maxGenerationTokens: 256,
      temperature: 0.7,
    }),
    prompt: {
      text: "Write a short story about a robot learning to love:\n\n",
    },
  });

  console.log(text);
}

main().catch(console.error);
