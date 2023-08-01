import { StabilityImageGenerationModel, generateImage } from "modelfusion";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

(async () => {
  const { image } = await generateImage(
    new StabilityImageGenerationModel({
      model: "stable-diffusion-512-v2-1",
      cfgScale: 7,
      clipGuidancePreset: "FAST_BLUE",
      height: 512,
      width: 512,
      samples: 1,
      steps: 30,
    }),
    [
      { text: "the wicked witch of the west" },
      { text: "style of early 19th century painting", weight: 0.5 },
    ]
  );

  const path = `./stability-image-example.png`;
  fs.writeFileSync(path, Buffer.from(image, "base64"));
  console.log(`Image saved to ${path}`);
})();
