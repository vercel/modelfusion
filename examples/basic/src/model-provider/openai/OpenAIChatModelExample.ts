import { OpenAIChatModel } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const chatModel = new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 500,
  });

  const text = await chatModel.generateText([
    {
      role: "system",
      content:
        "You are an AI assistant. Follow the user's instructions carefully.",
    },
    {
      role: "user",
      content: "Write a short story about a robot learning to love:\n\n",
    },
  ]);

  console.log(text);
})();
