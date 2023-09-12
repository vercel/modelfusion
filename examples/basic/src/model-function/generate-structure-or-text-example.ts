import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodStructureDefinition,
  generateStructureOrText,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const query = "What's the weather like in Boston?";
  // const query = "Where does Kevin work?";
  // const query = "Tell me something random.";

  const { structure, value, text } = await generateStructureOrText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo", maxCompletionTokens: 1000 }),
    [
      new ZodStructureDefinition({
        name: "getCurrentWeather" as const, // mark 'as const' for type inference
        description: "Get the current weather in a given location",
        schema: z.object({
          location: z
            .string()
            .describe("The city and state, e.g. San Francisco, CA"),
          unit: z.enum(["celsius", "fahrenheit"]).optional(),
        }),
      }),
      new ZodStructureDefinition({
        name: "getContactInformation" as const,
        description: "Get the contact information for a given person",
        schema: z.object({
          name: z.string().describe("The name of the person"),
        }),
      }),
    ],
    [OpenAIChatMessage.user(query)]
  );

  switch (structure) {
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
