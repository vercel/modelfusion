import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  Tool,
  useToolOrGenerateText,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

(async () => {
  const calculator = new Tool({
    name: "calculator" as const, // mark 'as const' for type inference
    description: "Execute a calculation",

    inputSchema: z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
      operator: z.enum(["+", "-", "*", "/"]).describe("The operator."),
    }),

    execute: async ({ a, b, operator }) => {
      switch (operator) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "*":
          return a * b;
        case "/":
          return a / b;
        default:
          throw new Error(`Unknown operator: ${operator}`);
      }
    },
  });

  const { tool, parameters, result, text } = await useToolOrGenerateText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    [calculator /* ... */],
    OpenAIChatFunctionPrompt.forToolsCurried([
      OpenAIChatMessage.user("What's fourteen times twelve?"),
    ])
  );

  console.log(tool != null ? `TOOL: ${tool}` : "TEXT");
  console.log(`PARAMETERS: ${JSON.stringify(parameters)}`);
  console.log(`TEXT: ${text}`);
  console.log(`RESULT: ${JSON.stringify(result)}`);
})();
