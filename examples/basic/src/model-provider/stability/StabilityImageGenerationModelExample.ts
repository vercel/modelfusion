import { StabilityImageGenerationModel } from "ai-utils.js/model-provider/stability";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

const STABILITY_API_KEY = process.env.STABILITY_API_KEY ?? "";

(async () => {
  const imageGenerationModel = new StabilityImageGenerationModel({
    apiKey: STABILITY_API_KEY,
    model: "stable-diffusion-512-v2-1",
    settings: {
      cfgScale: 7,
      clipGuidancePreset: "FAST_BLUE",
      height: 512,
      width: 512,
      samples: 1,
      steps: 30,
    },
  });

  const imageResponse = await imageGenerationModel.generate([
    { text: "the wicked witch of the west" },
    { text: "style of early 19th century painting", weight: 0.5 },
  ]);

  const image = await imageGenerationModel.extractImageBase64(imageResponse);

  const path = `./stability-image-example.png`;
  fs.writeFileSync(path, Buffer.from(image, "base64"));
  console.log(`Image saved to ${path}`);
})();
