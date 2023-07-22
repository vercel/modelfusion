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
    name: "multiply" as const, // important: mark as const for type inference
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
    // Instead of using a curried function, you can also work with the tools directly:
    (tools) =>
      OpenAIChatFunctionPrompt.forTools({
        tools,
        messages: [
          OpenAIChatMessage.system(
            // Here the available tools are used to create a more precise
            // prompt that reduces errors:
            `You have ${tools.length} tools available (${tools
              .map((tool) => tool.name)
              .join(", ")}).`
          ),
          OpenAIChatMessage.user("What's fourteen to the power of two?"),
          // OpenAIChatMessage.user("What's twelwe plus 1234?"),
          // OpenAIChatMessage.user("Tell me about Berlin"),
        ],
      })
  );

  console.log(tool != null ? `TOOL: ${tool}` : "TEXT");
  console.log(JSON.stringify(result, null, 2));
})();
