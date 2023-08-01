import { HuggingFaceTextGenerationModel, generateText } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const { text } = await generateText(
    new HuggingFaceTextGenerationModel({
      model: "tiiuae/falcon-7b",
      temperature: 700,
      maxNewTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
