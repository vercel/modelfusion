import { HuggingFaceTextGenerationModel } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY ?? "";

(async () => {
  const textGenerationModel = new HuggingFaceTextGenerationModel({
    apiKey: HUGGINGFACE_API_KEY,
    model: "tiiuae/falcon-7b",
    settings: { temperature: 700 },
  });

  const response = await textGenerationModel
    .withSettings({ maxNewTokens: 500 })
    .generate("Write a short story about a robot learning to love:\n\n");

  const text = await textGenerationModel.extractText(response);

  console.log(text);
})();
