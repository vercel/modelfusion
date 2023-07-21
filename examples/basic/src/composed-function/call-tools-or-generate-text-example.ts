import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  Tool,
  callToolOrGenerateText,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

(async () => {
  const multiplyTool = new Tool({
    name: "multiply" as const,
    description: "Multiply two numbers",

    inputSchema: z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
    }),

    run: async ({ a, b }) => a * b,
  });

  const addTool = new Tool({
    name: "add" as const,
    description: "Add two numbers",

    inputSchema: z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
    }),

    run: async ({ a, b }) => a + b,
  });

  const result = await callToolOrGenerateText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    [multiplyTool, addTool],
    // TODO enable easily working with passed-in tools.
    OpenAIChatFunctionPrompt.forToolChoice([
      OpenAIChatMessage.system("You have 2 tools available (add, multiply)."),
      OpenAIChatMessage.user("What's fourteen to the power of two?"),
      // OpenAIChatMessage.user("What's twelwe plus 1234?"),
      // OpenAIChatMessage.user("Tell me about Berlin"),
    ])
  );

  console.log(JSON.stringify(result, null, 2));
})();
