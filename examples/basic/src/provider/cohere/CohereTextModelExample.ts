import { createCohereTextModel } from "ai-utils.js/model/cohere";
import dotenv from "dotenv";

dotenv.config();

const COHERE_API_KEY = process.env.COHERE_API_KEY ?? "";

(async () => {
  const textModel = createCohereTextModel({
    apiKey: COHERE_API_KEY,
    model: "command-nightly",
    settings: { temperature: 0.7 },
  });

  const response = await textModel
    .withSettings({ maxCompletionTokens: 500 })
    .generate("Write a short story about a robot learning to love:\n\n");

  const text = await textModel.extractOutput(response);

  console.log(text);
})();
