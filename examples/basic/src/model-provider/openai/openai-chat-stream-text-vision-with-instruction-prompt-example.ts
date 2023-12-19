import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

async function main() {
  const image = fs.readFileSync(path.join("data", "example-image.png"), {
    encoding: "base64",
  });

  const textStream = await streamText(
    openai
      .ChatTextGenerator({
        model: "gpt-4-vision-preview",
        maxGenerationTokens: 1000,
      })
      .withInstructionPrompt(),
    {
      instruction: [
        { type: "text", text: "Describe the image in detail:\n\n" },
        { type: "image", base64Image: image, mimeType: "image/png" },
      ],
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
