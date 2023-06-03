import { generateOpenAIChatCompletion } from "ai-utils.js/model/openai";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const response = await generateOpenAIChatCompletion({
    apiKey: OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant. Follow the user's instructions carefully.",
      },
      {
        role: "user",
        content: "Hello, how are you?",
      },
    ],
    temperature: 0.7,
    maxTokens: 500,
  });

  console.log(response.choices[0].message.content);
})();
