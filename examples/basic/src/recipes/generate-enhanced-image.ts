import dotenv from "dotenv";
import {
  OpenAIChatModel,
  OpenAIImageGenerationModel,
  generateImage,
  generateText,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

const imageUrl =
  "https://upload.wikimedia.org/wikipedia/commons/d/d8/Steam_train%2C_Seahill_%281985%29_-_geograph.org.uk_-_3789663.jpg";

async function main() {
  const imageResponse = await fetch(imageUrl);
  const base64Image = Buffer.from(await imageResponse.arrayBuffer()).toString(
    "base64"
  );

  const imageGenerationPrompt = await generateText(
    new OpenAIChatModel({
      model: "gpt-4-vision-preview",
      maxCompletionTokens: 512,
    }).withInstructionPrompt(),
    {
      instruction:
        "Generate an image generation prompt for creating an image that resembles the attached image. Be precise and mention details.",
      image: { base64Content: base64Image },
    }
  );

  console.log();
  console.log(`Image generation prompt:\n${imageGenerationPrompt}`);

  const image = await generateImage(
    new OpenAIImageGenerationModel({
      model: "dall-e-3",
      quality: "hd",
      size: "1024x1024",
    }),
    imageGenerationPrompt
  );

  const path = `./enhanced-image-example.png`;
  fs.writeFileSync(path, image);
}

main().catch(console.error);
