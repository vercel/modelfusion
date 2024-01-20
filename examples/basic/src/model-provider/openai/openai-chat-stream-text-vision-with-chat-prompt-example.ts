import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

async function main() {
  const catImage = fs.readFileSync(path.join("data", "comic-cat.png"), {
    encoding: "base64",
  });
  const mouseImage = fs.readFileSync(path.join("data", "comic-mouse.png"), {
    encoding: "base64",
  });

  const textStream = await streamText({
    model: openai
      .ChatTextGenerator({
        model: "gpt-4-vision-preview",
        maxGenerationTokens: 1000,
      })
      .withChatPrompt(),

    prompt: {
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Here is a first image:" },
            { type: "image", image: catImage },
            { type: "text", text: " and another image:" },
            { type: "image", image: mouseImage },
            {
              type: "text",
              text: "Write a story about the characters from the 2 images.",
            },
          ],
        },
      ],
    },
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
