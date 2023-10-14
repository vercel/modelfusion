import { OpenAIImageGenerationModel, generateImage } from "modelfusion";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

async function main() {
  const image = await generateImage(
    new OpenAIImageGenerationModel({ size: "512x512" }),
    "the wicked witch of the west in the style of early 19th century painting"
  );

  const path = `./openai-image-example.png`;
  fs.writeFileSync(path, image);
  console.log(`Image saved to ${path}`);
}

main().catch(console.error);
