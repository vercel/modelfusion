import {
  OpenAITextGenerationModel,
  generateText,
  retryNever,
} from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const text = await generateText(
    new OpenAITextGenerationModel({ model: "text-davinci-003" }),
    "Write a short story about a robot learning to love:\n\n",
    { settings: { retry: retryNever() } }
  );

  console.log(text);
})();
