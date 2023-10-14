import { Automatic1111ImageGenerationModel, generateImage } from "modelfusion";
import fs from "node:fs";

async function main() {
  const image = await generateImage(
    new Automatic1111ImageGenerationModel({
      model: "aZovyaRPGArtistTools_v3.safetensors [25ba966c5d]",
      steps: 30,
      sampler: "DPM++ 2M Karras",
    }).withBasicPrompt(),
    "(lonely inn at the edge of a forest and at the side of a lake) (late spring evening before sunset) (clear sky) (plains) (nordic climate) (german early medieval architecture) (rpg) (fantasy) (Best quality) (masterpiece) (highly intricate details) (ultra realistic)"
  );

  const path = `./a1111-image-example.png`;
  fs.writeFileSync(path, image);
  console.log(`Image saved to ${path}`);
}

main().catch(console.error);
