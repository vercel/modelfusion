import { OpenAIChatMessage, OpenAIChatModel, streamText } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const tokenStream = await streamText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
    [
      OpenAIChatMessage.system("You are a story writer. Write a story about:"),
      OpenAIChatMessage.user("A robot learning to love"),
    ]
  );

  for await (const token of tokenStream) {
    process.stdout.write(token);
  }
})();
