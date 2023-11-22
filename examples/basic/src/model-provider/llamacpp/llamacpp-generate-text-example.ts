import { generateText, llamacpp } from "modelfusion";

async function main() {
  const text = await generateText(
    llamacpp.TextGenerator({
      maxCompletionTokens: 256,
      temperature: 0.7,
    }),
    {
      text: "Write a short story about a robot learning to love:\n\n",
    }
  );

  console.log(text);
}

main().catch(console.error);
