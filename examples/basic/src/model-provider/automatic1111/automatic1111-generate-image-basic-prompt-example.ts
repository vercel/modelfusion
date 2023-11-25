import { automatic1111, generateImage } from "modelfusion";
import fs from "node:fs";

async function main() {
  const image = await generateImage(
    automatic1111
      .ImageGenerator({
        model: "aZovyaRPGArtistTools_v3.safetensors [25ba966c5d]",
        steps: 30,
        sampler: "DPM++ 2M Karras",
      })
      .withTextPrompt(),
    "the wicked witch of the west in the style of early 19th century painting"
  );

  const path = `./a1111-image-example.png`;
  fs.writeFileSync(path, image);
  console.log(`Image saved to ${path}`);
}

main().catch(console.error);
