import dotenv from "dotenv";
import { generateImage, openai } from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const { images } = await generateImage(
    openai.ImageGenerator({
      model: "dall-e-3",
      numberOfGenerations: 2,
      size: "1024x1024",
    }),
    "the wicked witch of the west in the style of early 19th century painting",
    { fullResponse: true }
  );

  for (let i = 0; i < images.length; i++) {
    const path = `./openai-image-example-${i}.png`;
    fs.writeFileSync(path, images[i]);
    console.log(`Image saved to ${path}`);
  }
}

main().catch(console.error);
