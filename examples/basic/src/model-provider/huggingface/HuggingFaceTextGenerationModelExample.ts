import { HuggingFaceTextGenerationModel } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY ?? "";

(async () => {
  const textGenerationModel = new HuggingFaceTextGenerationModel({
    apiKey: HUGGINGFACE_API_KEY,
    model: "tiiuae/falcon-7b",
    temperature: 700,
    maxNewTokens: 500,
  });

  const text = await textGenerationModel.generateText(
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
