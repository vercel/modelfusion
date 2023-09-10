import dotenv from "dotenv";
import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodFunctionDescription,
  generateJsonOrText,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const query = "What's the weather like in Boston?";
  // const query = "Where does Kevin work?";
  // const query = "Tell me something random.";

  const { schema, value, text } = await generateJsonOrText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo", maxCompletionTokens: 1000 }),
    [
      new ZodFunctionDescription({
        name: "getCurrentWeather" as const, // mark 'as const' for type inference
        description: "Get the current weather in a given location",
        parameters: z.object({
          location: z
            .string()
            .describe("The city and state, e.g. San Francisco, CA"),
          unit: z.enum(["celsius", "fahrenheit"]).optional(),
        }),
      }),
      new ZodFunctionDescription({
        name: "getContactInformation" as const,
        description: "Get the contact information for a given person",
        parameters: z.object({
          name: z.string().describe("The name of the person"),
        }),
      }),
    ],
    OpenAIChatFunctionPrompt.forFunctionsCurried([
      OpenAIChatMessage.user(query),
    ])
  );

  switch (schema) {
    case "getCurrentWeather": {
      const { location, unit } = value;
      console.log("getCurrentWeather", location, unit);
      break;
    }

    case "getContactInformation": {
      const { name } = value;
      console.log("getContactInformation", name);
      break;
    }

    case null: {
      console.log("No function call. Generated text: ", text);
    }
  }
}

main().catch(console.error);
