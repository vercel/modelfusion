import dotenv from "dotenv";
import { generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText({
    model: openai.ChatTextGenerator({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxGenerationTokens: 500,
    }),
    prompt: [
      openai.ChatMessage.system(
        "Write a short story about a robot learning to love:"
      ),
    ],
  });

  console.log(text);
}

main().catch(console.error);
