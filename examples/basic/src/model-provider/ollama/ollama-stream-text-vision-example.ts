import { ollama, streamText } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const image = fs.readFileSync(path.join("data", "comic-mouse.png"), {
    encoding: "base64",
  });

  const textStream = await streamText(
    ollama.TextGenerator({
      model: "bakllava",
      maxGenerationTokens: 1024,
      temperature: 0,
    }),
    {
      prompt: "Describe the image in detail",
      images: [image],
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
