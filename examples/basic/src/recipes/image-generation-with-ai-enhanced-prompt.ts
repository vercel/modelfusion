import {
  Automatic1111ImageGenerationModel,
  OpenAIChatMessage,
  OpenAIChatModel,
} from "ai-utils.js";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

async function generateImage(imageRequest: string) {
  const textModel = new OpenAIChatModel({
    model: "gpt-4",
    temperature: 0, // remove randomness
    maxTokens: 500, // enough tokens for prompt
  });

  const imagePrompt = await textModel.generateText([
    OpenAIChatMessage.system(
      "You generate Stable Diffusion prompts for image generation." +
        "Generate a prompt for the following request:"
    ),
    OpenAIChatMessage.user(imageRequest),
  ]);

  const imageModel = new Automatic1111ImageGenerationModel({
    model: "aZovyaRPGArtistTools_v3.safetensors [25ba966c5d]",
    steps: 30,
    sampler: "DPM++ 2M Karras",
  });

  const image = await imageModel.generateImage({
    prompt: imagePrompt,
    negativePrompt:
      "(worst quality, low quality, bad_pictures)," +
      "(deformed, distorted, disfigured:1.3),(mutated hands and fingers:1.4)," +
      "poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs," +
      "disconnected limbs, mutation, mutated, ugly, blurry, amputation," +
      "(watermark) (label) (signature) (text) (cropped)",
  });

  return { prompt: imagePrompt, image };
}

(async () => {
  const { image, prompt } = await generateImage("wicked witch of the west");

  console.log(`Prompt: ${prompt}`);

  const path = `./a1111-image-example.png`;
  fs.writeFileSync(path, Buffer.from(image, "base64"));
  console.log(`Image saved to ${path}`);
})();
