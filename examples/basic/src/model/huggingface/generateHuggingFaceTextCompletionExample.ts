import dotenv from "dotenv";
import { generateHuggingFaceTextCompletion } from "ai-utils.js/model/huggingface";

dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY ?? "";

(async () => {
  const response = await generateHuggingFaceTextCompletion({
    apiKey: HUGGINGFACE_API_KEY,
    model: "tiiuae/falcon-7b",
    inputs: "Write a short story about a robot learning to love:\n\n",
    temperature: 700,
    maxNewTokens: 500,
    options: {
      waitForModel: true,
    },
  });

  console.log(response[0].generated_text);
})();
