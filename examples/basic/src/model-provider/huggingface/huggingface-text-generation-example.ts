import { HuggingFaceTextGenerationModel } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const textGenerationModel = new HuggingFaceTextGenerationModel({
    model: "tiiuae/falcon-7b",
    temperature: 700,
    maxNewTokens: 500,
  });

  const text = await textGenerationModel.generateText(
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
