import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  Tool,
  callTool,
  callTools,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

(async () => {
  const multiplyTool = new Tool({
    name: "multiply",
    description: "Multiply two numbers",

    inputSchema: z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
    }),

    run: async ({ a, b }) => a * b,
  });

  const result = await callTools(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    {
      multiply: multiplyTool,
    },
    OpenAIChatFunctionPrompt.forToolChoice([
      OpenAIChatMessage.user("What's fourteen to the power of two?"),
      // OpenAIChatMessage.user("Tell me about Berlin"),
    ])
  );

  console.log(JSON.stringify(result, null, 2));
})();
