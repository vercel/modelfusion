import dotenv from "dotenv";
import {
  executeFunction,
  generateImage,
  generateText,
  openai,
  setGlobalFunctionLogging,
  stability,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

setGlobalFunctionLogging("detailed-object");

async function main() {
  const image = await executeFunction(
    async (imageUrl, options) => {
      const base64Image = await executeFunction(
        async (imageUrl) => {
          const imageResponse = await fetch(imageUrl);
          return Buffer.from(await imageResponse.arrayBuffer()).toString(
            "base64"
          );
        },
        imageUrl,
        { functionId: "fetch-image", ...options }
      );

      const imageGenerationPrompt = await generateText(
        openai
          .ChatTextGenerator({
            model: "gpt-4-vision-preview",
            maxCompletionTokens: 128,
          })
          .withInstructionPrompt(),
        {
          instruction:
            "Generate an image generation prompt for creating a cyberpunk-style image that resembles the attached image. " +
            "Capture the essence of the image in 1-2 sentences.",
          image: { base64Content: base64Image },
        }
      );

      return generateImage(
        stability.ImageGenerator({
          model: "stable-diffusion-512-v2-1",
          height: 512,
          width: 512,
          samples: 1,
          steps: 30,
        }),
        [{ text: imageGenerationPrompt }],
        { functionId: "generate-image", ...options }
      );
    },
    "https://upload.wikimedia.org/wikipedia/commons/d/d8/Steam_train%2C_Seahill_%281985%29_-_geograph.org.uk_-_3789663.jpg",
    { functionId: "enhance-image" }
  );

  const path = `./enhanced-image-example.png`;
  fs.writeFileSync(path, image);
}

main().catch(console.error);
