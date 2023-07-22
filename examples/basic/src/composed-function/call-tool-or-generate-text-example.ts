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
    name: "multiply" as const, // mark 'as const' for type inference
    description: "Multiply two numbers",

    inputSchema: z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
    }),

    execute: async ({ a, b }) => a * b,
  });

  const addTool = new Tool({
    name: "add" as const,
    description: "Add two numbers",

    inputSchema: z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
    }),

    execute: async ({ a, b }) => a + b,
  });

  const { tool, result } = await callToolOrGenerateText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    [multiplyTool, addTool],
    OpenAIChatFunctionPrompt.forToolsCurried([
      OpenAIChatMessage.user("What's fourteen to the power of two?"),
    ])
  );

  console.log(tool != null ? `TOOL: ${tool}` : "TEXT");
  console.log(JSON.stringify(result, null, 2));
})();
