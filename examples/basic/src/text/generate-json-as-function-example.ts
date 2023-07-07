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

  const generateStoryAbout = model.generateJsonAsFunction(
    async (theme: string) => [
      OpenAIChatMessage.system("You are a story writer. Write a story about:"),
      OpenAIChatMessage.user(theme),
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

  const story = await generateStoryAbout("A robot learning to love");

  console.log(JSON.stringify(story, null, 2));
})();
