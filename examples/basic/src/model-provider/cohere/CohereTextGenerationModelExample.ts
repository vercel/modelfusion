import { CohereTextGenerationModel } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

const COHERE_API_KEY = process.env.COHERE_API_KEY ?? "";

(async () => {
  const textGenerationModel = new CohereTextGenerationModel({
    apiKey: COHERE_API_KEY,
    model: "command-nightly",
    settings: { temperature: 0.7 },
  });

  const response = await textGenerationModel
    .withSettings({ maxTokens: 500 })
    .generate("Write a short story about a robot learning to love:\n\n");

  const text = await textGenerationModel.extractText(response);

  console.log(text);
})();
