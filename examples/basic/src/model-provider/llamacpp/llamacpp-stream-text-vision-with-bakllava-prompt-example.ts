import { LlamaCppBakLLaVA1Format, llamacpp, streamText } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const image = fs.readFileSync(path.join("data", "example-image.png"), {
    encoding: "base64",
  });

  const textStream = await streamText(
    llamacpp
      .TextGenerator({
        maxCompletionTokens: 1024,
        temperature: 0,
      })
      .withPromptFormat(LlamaCppBakLLaVA1Format.instruction()),
    {
      instruction: [
        { type: "text", text: "Describe the image in detail:\n\n" },
        { type: "image", base64Image: image },
      ],
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
