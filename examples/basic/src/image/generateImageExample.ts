import { StabilityImageGenerationModel } from "ai-utils.js/provider/stability";
import { generateImage } from "ai-utils.js/image";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

const STABILITY_API_KEY = process.env.STABILITY_API_KEY ?? "";

(async () => {
  const model = new StabilityImageGenerationModel({
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

  const generatePainting = generateImage.asFunction({
    model,
    prompt: async ({ description }: { description: string }) => [
      { text: description },
      { text: "style of early 19th century painting", weight: 0.5 },
    ],
  });

  const imageBase64 = await generatePainting({
    description: "the wicked witch of the west",
  });

  const path = `./stability-image-example.png`;
  fs.writeFileSync(path, Buffer.from(imageBase64, "base64"));
  console.log(`Image saved to ${path}`);
})();
