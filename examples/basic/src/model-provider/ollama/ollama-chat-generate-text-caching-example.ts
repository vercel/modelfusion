import { MemoryCache, generateText, modelfusion, ollama } from "modelfusion";

modelfusion.setLogFormat("detailed-object");

const model = ollama
  .ChatTextGenerator({ model: "llama2:chat", maxGenerationTokens: 100 })
  .withTextPrompt();

async function main() {
  const cache = new MemoryCache();

  const text1 = await generateText(
    model,
    "Write a short story about a robot learning to love:",
    { cache }
  );

  console.log(text1);

  const text2 = await generateText(
    model,
    "Write a short story about a robot learning to love:", // same text
    { cache }
  );

  console.log(text2);
}

main().catch(console.error);
