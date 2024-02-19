import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

async function main() {
  const image = fs.readFileSync(
    path.join(__dirname, "../../data/example-image.png")
  );

  const textStream = await streamText({
    model: openai.ChatTextGenerator({
      model: "gpt-4-vision-preview",
      maxGenerationTokens: 1000,
    }),

    prompt: [
      openai.ChatMessage.user([
        { type: "text", text: "Describe the image in detail:\n\n" },
        { type: "image", image, mimeType: "image/png" },
      ]),
    ],
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
