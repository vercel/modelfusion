import { llamacpp, streamText } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const image = fs.readFileSync(path.join("data", "example-image.png"), {
    encoding: "base64",
  });

  const textStream = await streamText(
    llamacpp.TextGenerator({
      maxCompletionTokens: 1024,
      temperature: 0,
    }),
    {
      text: "[img-1]\n\nDescribe the image in detail:\n\n",
      images: { "1": image },
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
