import { CohereTextGenerationModel } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const textGenerationModel = new CohereTextGenerationModel({
    model: "command-nightly",
    temperature: 0.7,
    maxTokens: 500,
  });

  const text = await textGenerationModel.generateText(
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
