import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  Tool,
  useTool,
} from "modelfusion";
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

  const { tool, parameters, result } = await useTool(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    calculator,
    OpenAIChatFunctionPrompt.forToolCurried([
      OpenAIChatMessage.user("What's fourteen times twelve?"),
    ])
  );

  console.log(`Tool: ${tool}`);
  console.log(`Parameters: ${JSON.stringify(parameters)}`);
  console.log(`Result: ${result}`);
})();
