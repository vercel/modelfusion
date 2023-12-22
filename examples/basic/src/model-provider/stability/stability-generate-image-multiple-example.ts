import dotenv from "dotenv";
import { generateImage, stability } from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const { images } = await generateImage(
    stability.ImageGenerator({
      model: "stable-diffusion-v1-6",
      numberOfGenerations: 2,
      cfgScale: 7,
      clipGuidancePreset: "FAST_BLUE",
      height: 512,
      width: 512,
      steps: 30,
    }),
    [
      { text: "the wicked witch of the west" },
      { text: "style of early 19th century painting", weight: 0.5 },
    ],
    { fullResponse: true }
  );

  for (let i = 0; i < images.length; i++) {
    const path = `./stability-image-example-${i}.png`;
    fs.writeFileSync(path, images[i]);
    console.log(`Image saved to ${path}`);
  }
}

main().catch(console.error);
