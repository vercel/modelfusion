import { OpenAITextGenerationModel, retryNever } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const model = new OpenAITextGenerationModel({
    model: "text-davinci-003",
  });

  const text = await model.generateText(
    "Write a short story about a robot learning to love:\n\n",
    {
      retry: retryNever(),
    }
  );

  console.log(text);
})();
