import dotenv from "dotenv";
import { generateText, openaicompatible } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText({
    model: openaicompatible
      .ChatTextGenerator({
        api: openaicompatible.FireworksAIApi(),
        provider: "openaicompatible-fireworksai",
        model: "accounts/fireworks/models/llama-v2-7b-chat",
      })
      .withTextPrompt(),

    prompt: "Write a story about a robot learning to love",
  });

  console.log(text);
}

main().catch(console.error);
