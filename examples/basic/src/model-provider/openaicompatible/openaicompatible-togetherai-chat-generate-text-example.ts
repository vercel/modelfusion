import dotenv from "dotenv";
import { generateText, openaicompatible } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText({
    model: openaicompatible
      .ChatTextGenerator({
        api: openaicompatible.TogetherAIApi(),
        provider: "openaicompatible-togetherai",
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        maxGenerationTokens: 200,
      })
      .withTextPrompt(),

    prompt: "Write a story about a robot learning to love",
  });

  console.log(text);
}

main().catch(console.error);
