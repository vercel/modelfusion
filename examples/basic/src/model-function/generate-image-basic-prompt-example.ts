import { StabilityImageGenerationModel, generateImage } from "modelfusion";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

async function main() {
  const image = await generateImage(
    new StabilityImageGenerationModel({
      model: "stable-diffusion-512-v2-1",
      cfgScale: 7,
      clipGuidancePreset: "FAST_BLUE",
      height: 512,
      width: 512,
      samples: 1,
      steps: 30,
    }).withBasicPrompt(),
    "the wicked witch of the west in the style of early 19th century painting"
  );

  const path = `./stability-image-example.png`;
  fs.writeFileSync(path, image);
  console.log(`Image saved to ${path}`);
}

main().catch(console.error);
