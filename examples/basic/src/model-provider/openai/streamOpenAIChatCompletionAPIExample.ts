import { streamOpenAIChatCompletionAPI } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const stream = await streamOpenAIChatCompletionAPI({
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
    responseFormat:
      streamOpenAIChatCompletionAPI.responseFormat.asyncDeltaIterable,
  });

  for await (const piece of stream) {
    if (piece?.type === "delta") {
      process.stdout.write(piece.delta[0].delta.content ?? "");
    }
  }
})();
