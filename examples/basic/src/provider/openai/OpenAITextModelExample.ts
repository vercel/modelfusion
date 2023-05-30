import { createOpenAITextModel } from "ai-utils.js/provider/openai";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const textModel = createOpenAITextModel({
    apiKey: OPENAI_API_KEY,
    model: "text-davinci-003",
    settings: { temperature: 0.7 },
  });

  const response = await textModel
    .withSettings({ maxCompletionTokens: 500 })
    .generate("Write a short story about a robot learning to love:\n\n");

  const text = await textModel.extractOutput(response);

  console.log(text);
})();
