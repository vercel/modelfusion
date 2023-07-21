import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  generateJsonForSchema,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

(async () => {
  const story = await generateJsonForSchema(
    new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
    {
      name: "story",
      description: "Write the story",
      schema: z.object({
        title: z.string().describe("The title of the story"),
        content: z.string().describe("The content of the story"),
      }),
    },
    OpenAIChatFunctionPrompt.forSchema([
      OpenAIChatMessage.system("You are a story writer. Write a story about:"),
      OpenAIChatMessage.user("A robot learning to love"),
    ])
  );

  console.log(JSON.stringify(story, null, 2));
})();
