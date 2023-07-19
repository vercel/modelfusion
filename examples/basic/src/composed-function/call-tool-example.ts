import {
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAIChatSingleFunctionPrompt,
  callTool,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

(async () => {
  const json = await callTool(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    {
      name: "getCurrentWeather",
      description: "Get the current weather in a given location",
      inputSchema: z.object({
        location: z
          .string()
          .describe("The city and state, e.g. San Francisco, CA"),
        unit: z.enum(["celsius", "fahrenheit"]).optional(),
      }),
      run: async ({ location, unit = "fahrenheit" }) => ({
        location,
        temperature: "72",
        unit,
        forecast: ["sunny", "windy"],
      }),
    },
    (tool) =>
      new OpenAIChatSingleFunctionPrompt({
        messages: [
          OpenAIChatMessage.user("What's the weather like in Boston?"),
        ],
        fn: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      })
  );

  console.log(JSON.stringify(json, null, 2));
})();
