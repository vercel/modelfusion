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
  const query = "What's the weather like in Boston?";
  // const query = "Where does Kevin work?";
  // const query = "Tell me something random.";

  const { schema, value, text } = await generateJsonOrText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
    [
      {
        name: "getCurrentWeather" as const, // mark 'as const' for type inference
        description: "Get the current weather in a given location",
        schema: z.object({
          location: z
            .string()
            .describe("The city and state, e.g. San Francisco, CA"),
          unit: z.enum(["celsius", "fahrenheit"]).optional(),
        }),
      },
      {
        name: "getContactInformation" as const,
        description: "Get the contact information for a given person",
        schema: z.object({
          name: z.string().describe("The name of the person"),
        }),
      },
    ],
    OpenAIChatFunctionPrompt.forSchemasCurried([OpenAIChatMessage.user(query)])
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
})();
