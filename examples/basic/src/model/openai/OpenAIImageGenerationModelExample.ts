import { OpenAIImageGenerationModel } from "ai-utils.js";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const imageGenerationModel = new OpenAIImageGenerationModel({
    apiKey: OPENAI_API_KEY,
    settings: {
      size: "512x512",
    },
  });

  const imageResponse = await imageGenerationModel.generate(
    "the wicked witch of the west in the style of early 19th century painting"
  );

  const image = await imageGenerationModel.extractImageBase64(imageResponse);

  const path = `./openai-image-example.png`;
  fs.writeFileSync(path, Buffer.from(image, "base64"));
  console.log(`Image saved to ${path}`);
})();
