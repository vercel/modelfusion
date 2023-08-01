import { Automatic1111ImageGenerationModel, generateImage } from "modelfusion";
import fs from "node:fs";

(async () => {
  const { image } = await generateImage(
    new Automatic1111ImageGenerationModel({
      model: "aZovyaRPGArtistTools_v3.safetensors [25ba966c5d]",
      steps: 30,
      sampler: "DPM++ 2M Karras",
    }),
    {
      prompt:
        "(lonely inn at the edge of a forest and at the side of a lake) (late spring evening before sunset) (clear sky) (plains) (nordic climate) (german early medieval architecture) (rpg) (fantasy) (Best quality) (masterpiece) (highly intricate details) (ultra realistic)",
      negativePrompt:
        "(worst quality, low quality, bad_pictures) (deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, blurry, amputation, (watermark) (label) (signature) (text) (cropped) (castle) (mountain) (monastery)",
    }
  );

  const path = `./a1111-image-example.png`;
  fs.writeFileSync(path, Buffer.from(image, "base64"));
  console.log(`Image saved to ${path}`);
})();
