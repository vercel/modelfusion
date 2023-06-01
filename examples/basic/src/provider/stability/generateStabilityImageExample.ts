import { generateStabilityImage } from "ai-utils.js/provider/stability";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

const STABILITY_API_KEY = process.env.STABILITY_API_KEY ?? "";

(async () => {
  const imageResponse = await generateStabilityImage({
    apiKey: STABILITY_API_KEY,
    engineId: "stable-diffusion-512-v2-1",
    textPrompts: [
      { text: "the wicked witch of the west" },
      { text: "style of early 19th century painting", weight: 0.5 },
    ],
    cfgScale: 7,
    clipGuidancePreset: "FAST_BLUE",
    height: 512,
    width: 512,
    samples: 1,
    steps: 30,
  });

  imageResponse.artifacts.forEach((image, index) => {
    fs.writeFileSync(
      `./stability-image-example-${index}.png`,
      Buffer.from(image.base64, "base64")
    );
  });
})();
