import { LlamaCppTextGenerationModel, generateText } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const text = await generateText(
    new LlamaCppTextGenerationModel({ nPredict: 512 }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
