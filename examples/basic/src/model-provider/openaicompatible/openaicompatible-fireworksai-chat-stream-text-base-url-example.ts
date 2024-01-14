import dotenv from "dotenv";
import {
  BaseUrlApiConfiguration,
  openaicompatible,
  streamText,
} from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText({
    model: openaicompatible
      .ChatTextGenerator({
        api: new BaseUrlApiConfiguration({
          baseUrl: "https://api.fireworks.ai/inference/v1",
          headers: {
            Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
          },
        }),
        provider: "openaicompatible-fireworksai",
        model: "accounts/fireworks/models/llama-v2-7b-chat",
      })
      .withTextPrompt(),

    prompt: "Write a story about a robot learning to love",
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
