import dotenv from "dotenv";
import { generateText, openai } from "modelfusion";
import { FileCache } from "modelfusion/server";

dotenv.config();

async function main() {
  const model = openai.ChatTextGenerator({
    model: "gpt-3.5-turbo",
    temperature: 1,
    maxGenerationTokens: 200,
  });

  const messages = openai.ChatMessage.system(
    "Write a short story about a robot learning to love:"
  );

  const cache = new FileCache();

  console.time("First text generation");
  const text1 = await generateText({ model, prompt: [messages], cache });
  console.timeEnd("First text generation");

  console.log({ text1 });

  console.time("Second text generation");
  const text2 = await generateText({ model, prompt: [messages], cache });
  console.timeEnd("Second text generation");

  console.log({ text2 }); // same text
}

main().catch(console.error);
