import { OpenAIChatMessage, OpenAIChatModel } from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

(async () => {
  const model = new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 1000,
  });

  const json = await model.generateJson(
    [
      OpenAIChatMessage.system("You are a story writer. Write a story about:"),
      OpenAIChatMessage.user("A robot learning to love"),
    ],
    {
      name: "story",
      description: "Write the story",
      parameters: z.object({
        title: z.string().describe("The title of the story"),
        content: z.string().describe("The content of the story"),
      }),
    }
  );

  console.log(JSON.stringify(json, null, 2));
})();
