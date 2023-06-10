import { OpenAIImageGenerationModel } from "ai-utils.js";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

(async () => {
  const model = new OpenAIImageGenerationModel({
    size: "512x512",
  });

  const image = await model.generateImage(
    "the wicked witch of the west in the style of early 19th century painting"
  );

  const path = `./openai-image-example.png`;
  fs.writeFileSync(path, Buffer.from(image, "base64"));
  console.log(`Image saved to ${path}`);
})();
