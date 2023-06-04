import dotenv from "dotenv";
import { callOpenAITextGenerationAPI } from "ai-utils.js";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const response = await callOpenAITextGenerationAPI({
    apiKey: OPENAI_API_KEY,
    model: "text-davinci-003",
    prompt: "Write a short story about a robot learning to love:\n\n",
    temperature: 0.7,
    maxTokens: 500,
  });

  console.log(response.choices[0].text);
})();
