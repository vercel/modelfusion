import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  Tool,
  ToolExecutionError,
  ZodSchema,
  useTool,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

export const calculatorThatThrowsError = new Tool({
  name: "calculator",
  description: "Execute a calculation",

  inputSchema: new ZodSchema(
    z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
      operator: z
        .enum(["+", "-", "*", "/"])
        .describe("The operator (+, -, *, /)."),
    })
  ),

  execute: async ({ a, b, operator }) => {
    throw new Error("This tool always throws an error.");
  },
});

async function main() {
  try {
    const ignoredResult = await useTool(
      new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
      calculatorThatThrowsError,
      [OpenAIChatMessage.user("What's fourteen times twelve?")]
    );
  } catch (error) {
    if (error instanceof ToolExecutionError) {
      console.log(`Error message: ${error.message}`);
      console.log(`Tool: ${error.toolName}`);
      console.log(`Parameters: ${JSON.stringify(error.input)}`);
    }
  }
}

main().catch(console.error);
