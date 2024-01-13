import dotenv from "dotenv";
import { generateImage, openai } from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const image = await generateImage({
    model: openai.ImageGenerator({ model: "dall-e-3", size: "1024x1024" }),
    prompt:
      "the wicked witch of the west in the style of early 19th century painting",
  });

  const path = `./openai-image-example.png`;
  fs.writeFileSync(path, image);
  console.log(`Image saved to ${path}`);
}

main().catch(console.error);
