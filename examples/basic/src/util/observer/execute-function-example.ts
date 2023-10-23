import dotenv from "dotenv";
import {
  HuggingFaceImageDescriptionModel,
  OpenAIChatModel,
  StabilityImageGenerationModel,
  executeFunction,
  generateImage,
  generateText,
  mapInstructionPromptToOpenAIChatFormat,
  setGlobalFunctionLogging,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

setGlobalFunctionLogging("detailed-object");

async function main() {
  const image = await executeFunction(
    async (imageUrl, options) => {
      const data = await executeFunction(
        async (imageUrl) => {
          const imageResponse = await fetch(imageUrl);
          return Buffer.from(await imageResponse.arrayBuffer());
        },
        imageUrl,
        { functionId: "fetch-image", ...options }
      );

      const imageDescription = await generateText(
        new HuggingFaceImageDescriptionModel({
          model: "nlpconnect/vit-gpt2-image-captioning",
        }),
        data,
        { functionId: "describe-image", ...options }
      );

      const imageGenerationPrompt = await generateText(
        new OpenAIChatModel({ model: "gpt-4" }).withPromptFormat(
          mapInstructionPromptToOpenAIChatFormat()
        ),
        {
          instruction:
            "You generate Stable Diffusion prompts for images." +
            "Generate a prompt for a high resolution, cyberpunk version of the following image description:",
          input: imageDescription,
        },
        { functionId: "generate-image-prompt", ...options }
      );

      return generateImage(
        new StabilityImageGenerationModel({
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
