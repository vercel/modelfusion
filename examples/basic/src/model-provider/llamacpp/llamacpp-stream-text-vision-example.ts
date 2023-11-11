import { LlamaCppTextGenerationModel, streamText } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      maxCompletionTokens: 1024,
      temperature: 0.7,
    }),
    {
      text: "Image: [img-1]\n\nDescribe the image in detail:\n\n",
      images: {
        "1": fs.readFileSync(path.join("data", "example-image.png"), {
          encoding: "base64",
        }),
      },
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
