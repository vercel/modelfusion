import { llamacpp, streamText } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const image = fs.readFileSync(path.join("data", "comic-mouse.png"));

  const textStream = await streamText({
    model: llamacpp.CompletionTextGenerator({
      maxGenerationTokens: 1024,
      temperature: 0,
    }),
    prompt: {
      text: "[img-1]\n\nDescribe the image in detail:\n\n",
      images: { "1": image },
    },
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
