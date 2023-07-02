import { A1111ImageGenerationModel } from "ai-utils.js";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

(async () => {
  const model = new A1111ImageGenerationModel({
    model: "aZovyaRPGArtistTools_v3.safetensors [25ba966c5d]",
    steps: 30,
    sampler: "DPM++ 2M Karras",
  });

  const image = await model.generateImage({
    prompt:
      "(the wicked witch of the west) (style of early 19th century painting)",
    negativePrompt:
      "poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, blurry",
  });

  const path = `./a1111-image-example.png`;
  fs.writeFileSync(path, Buffer.from(image, "base64"));
  console.log(`Image saved to ${path}`);
})();
