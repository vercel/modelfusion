import { Tool } from "modelfusion";
import { z } from "zod";

export const calculator = new Tool({
  name: "calculator",
  description: "Execute a calculation",

  inputSchema: z.object({
    a: z.number().describe("The first number."),
    b: z.number().describe("The second number."),
    operator: z
      .enum(["+", "-", "*", "/"])
      .describe("The operator (+, -, *, /)."),
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
