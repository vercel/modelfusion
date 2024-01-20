import { ollama, streamText } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const image = fs.readFileSync(path.join("data", "comic-mouse.png"));

  const textStream = await streamText({
    model: ollama
      .ChatTextGenerator({
        model: "bakllava",
        maxGenerationTokens: 1024,
        temperature: 0,
      })
      .withInstructionPrompt(),

    prompt: {
      instruction: [
        { type: "text", text: "Describe the image in detail:\n\n" },
        { type: "image", image, mimeType: "image/png" },
      ],
    },
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
