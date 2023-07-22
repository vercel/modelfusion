import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  generateJsonOrText,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

(async () => {
  const { schema, value } = await generateJsonOrText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    [
      {
        name: "multiply" as const,
        description: "Multiply two numbers",
        schema: z.object({
          a: z.number().describe("The first number."),
          b: z.number().describe("The second number."),
        }),
      },
      {
        name: "sum" as const,
        description: "Sum two numbers",
        schema: z.object({
          a: z.number().describe("The first number."),
          b: z.number().describe("The second number."),
        }),
      },
    ],
    OpenAIChatFunctionPrompt.forSchemasCurried([
      OpenAIChatMessage.system(
        "You are a calculator. Evaluate the following expression:"
      ),
      OpenAIChatMessage.user("Multiply twelve with 10."),
    ])
  );

  switch (schema) {
    case null: {
      console.log(`TEXT: ${value}`);
      break;
    }

    case "multiply": {
      console.log(`MULTIPLY: ${value.a * value.b}`);
      break;
    }

    case "sum": {
      console.log(`SUM: ${value.a + value.b}`);
      break;
    }
  }
})();
