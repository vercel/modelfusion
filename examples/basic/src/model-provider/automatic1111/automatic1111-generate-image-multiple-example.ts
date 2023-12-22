import dotenv from "dotenv";
import { automatic1111, generateImage } from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const { images } = await generateImage(
    automatic1111.ImageGenerator({
      numberOfGenerations: 2,
      model: "aZovyaRPGArtistTools_v4.safetensors",
      steps: 30,
      sampler: "DPM++ 2M Karras",
      width: 512,
      height: 512,
    }),
    {
      prompt:
        "zprgstyle, lonely inn at the edge of a forest and at the side of a lake, " +
        "late spring evening before sunset, clear sky, plains, nordic climate, " +
        "german early medieval architecture, fantasy, Best quality, masterpiece, " +
        "highly intricate details, ultra realistic",
      negativePrompt:
        "worst quality, low quality, bad_pictures, deformed, distorted, (disfigured:1.3), poorly drawn, " +
        "bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), " +
        "disconnected limbs, mutation, mutated, ugly, blurry, amputation, (watermark), (label), (signature), " +
        "(text), (cropped), (castle), (mountain), (monastery)",
    },
    { fullResponse: true }
  );

  for (let i = 0; i < images.length; i++) {
    const path = `./automatic1111-image-example-${i}.png`;
    fs.writeFileSync(path, images[i]);
    console.log(`Image saved to ${path}`);
  }
}

main().catch(console.error);
