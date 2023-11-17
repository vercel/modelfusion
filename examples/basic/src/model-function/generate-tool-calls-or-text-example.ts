import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodSchema,
  generateToolCallsOrText,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const query = "What's the weather like in Boston?";
  // const query = "Where does Kevin work?";
  // const query = "Tell me something random.";

  const { text, toolCalls } = await generateToolCallsOrText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo", maxCompletionTokens: 1000 }),
    [
      {
        name: "getCurrentWeather" as const, // mark 'as const' for type inference
        description: "Get the current weather in a given location",
        parameters: new ZodSchema(
          z.object({
            location: z
              .string()
              .describe("The city and state, e.g. San Francisco, CA"),
            unit: z.enum(["celsius", "fahrenheit"]).optional(),
          })
        ),
      },
      {
        name: "getContactInformation" as const,
        description: "Get the contact information for a given person",
        parameters: new ZodSchema(
          z.object({
            name: z.string().describe("The name of the person"),
          })
        ),
      },
    ],
    [OpenAIChatMessage.user(query)]
  );

  if (text != null) {
    console.log(`TEXT: ${text}`);
  }

  for (const toolCall of toolCalls ?? []) {
    console.log("tool call " + toolCall.id);

    switch (toolCall.name) {
      case "getCurrentWeather": {
        const { location, unit } = toolCall.parameters;
        console.log("getCurrentWeather", location, unit);
        break;
      }

      case "getContactInformation": {
        const { name } = toolCall.parameters;
        console.log("getContactInformation", name);
        break;
      }
    }
  }
}

main().catch(console.error);
