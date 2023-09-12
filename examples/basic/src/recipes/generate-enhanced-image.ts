import dotenv from "dotenv";
import {
  HuggingFaceImageDescriptionModel,
  mapInstructionPromptToOpenAIChatFormat,
  OpenAIChatModel,
  StabilityImageGenerationModel,
  describeImage,
  generateImage,
  generateText,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

const imageUrl =
  "https://upload.wikimedia.org/wikipedia/commons/d/d8/Steam_train%2C_Seahill_%281985%29_-_geograph.org.uk_-_3789663.jpg";

async function main() {
  const imageResponse = await fetch(imageUrl);
  const data = Buffer.from(await imageResponse.arrayBuffer());

  const imageDescription = await describeImage(
    new HuggingFaceImageDescriptionModel({
      model: "nlpconnect/vit-gpt2-image-captioning",
    }),
    data
  );

  console.log(`Image description:\n${imageDescription}`);

  const imageGenerationPrompt = await generateText(
    new OpenAIChatModel({ model: "gpt-4" }).withPromptFormat(
      mapInstructionPromptToOpenAIChatFormat()
    ),
    {
      instruction:
        "You generate Stable Diffusion prompts for images." +
        "Generate a prompt for a high resolution, cyberpunk version of the following image description:",
      input: imageDescription,
    }
  );

  console.log();
  console.log(`Image generation prompt:\n${imageGenerationPrompt}`);

  const image = await generateImage(
    new StabilityImageGenerationModel({
      model: "stable-diffusion-512-v2-1",
      height: 512,
      width: 512,
      samples: 1,
      steps: 30,
    }),
    [{ text: imageGenerationPrompt }]
  );

  const path = `./enhanced-image-example.png`;
  fs.writeFileSync(path, Buffer.from(image, "base64"));
}

main().catch(console.error);
