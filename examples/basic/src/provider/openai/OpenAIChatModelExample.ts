import { OpenAIChatModel } from "ai-utils.js/provider/openai";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const chatModel = new OpenAIChatModel({
    apiKey: OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
    settings: { temperature: 0.7 },
  });

  const response = await chatModel.withSettings({ maxTokens: 500 }).generate([
    {
      role: "system",
      content:
        "You are an AI assistant. Follow the user's instructions carefully.",
    },
    {
      role: "user",
      content: "Hello, how are you?",
    },
  ]);

  const text = await chatModel.extractOutput(response);

  console.log(text);
})();
