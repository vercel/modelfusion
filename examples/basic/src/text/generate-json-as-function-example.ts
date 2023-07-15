import {
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAIChatSingleFunctionPrompt,
  generateJsonAsFunction,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

(async () => {
  const generateStoryAbout = generateJsonAsFunction(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 1000,
    }),
    async (theme: string) =>
      new OpenAIChatSingleFunctionPrompt({
        messages: [
          OpenAIChatMessage.system(
            "You are a story writer. Write a story about:"
          ),
          OpenAIChatMessage.user(theme),
        ],
        fn: {
          name: "story",
          description: "Write the story",
          parameters: z.object({
            title: z.string().describe("The title of the story"),
            content: z.string().describe("The content of the story"),
          }),
        },
      })
  );

  const story = await generateStoryAbout("A robot learning to love");

  console.log(JSON.stringify(story, null, 2));
})();
