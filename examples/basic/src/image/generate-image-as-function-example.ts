import { StabilityImageGenerationModel } from "ai-utils.js";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

(async () => {
  const model = new StabilityImageGenerationModel({
    model: "stable-diffusion-512-v2-1",
    cfgScale: 7,
    clipGuidancePreset: "FAST_BLUE",
    height: 512,
    width: 512,
    samples: 1,
    steps: 30,
  });

  const generatePainting = model.generateImageAsFunction(
    async (description: string) => [
      { text: description },
      { text: "style of early 19th century painting", weight: 0.5 },
    ]
  );

  const imageBase64 = await generatePainting("the wicked witch of the west");

  const path = `./stability-image-example.png`;
  fs.writeFileSync(path, Buffer.from(imageBase64, "base64"));
  console.log(`Image saved to ${path}`);
})();
