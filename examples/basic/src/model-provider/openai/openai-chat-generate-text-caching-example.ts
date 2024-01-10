import dotenv from "dotenv";
import { MemoryCache, generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  const model = openai.ChatTextGenerator({
    model: "gpt-3.5-turbo",
    temperature: 1,
    maxGenerationTokens: 200,
  });

  const messages = openai.ChatMessage.system("Write a short story about a robot learning to love:");

  const cache = new MemoryCache();

  const text1 = await generateText(model, [ messages ], { cache } );

  console.log({text1});

  const text2 = await generateText(model, [ messages ], { cache } );
  
  console.log({text2}); // same text
}

main().catch(console.error);
