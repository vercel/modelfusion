---
sidebar_position: 10
---

# Creating Tools

You can create the tools that you need for yor application by using the [Tool class](/api/classes/Tool).

A tool is comprised of an async execute function, a name, a description, and a schema for the input parameters.

## Example: Calculator Tool

```ts
import { Tool, zodSchema } from "modelfusion";
import { z } from "zod";

const calculator = new Tool({
  name: "calculator",
  description: "Execute a calculation",

  // The input schema describes the parameters that the tool expects.
  // You can use any ModelFusion schema (here: ZodSchema).
  parameters: zodSchema(
    z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
      operator: z
        .enum(["+", "-", "*", "/"])
        .describe("The operator (+, -, *, /)."),
    })
  ),

  // The execute function is called with the parameters.
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
```
