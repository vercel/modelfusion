import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  Tool,
  callTool,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

(async () => {
  const currentWeatherTool = new Tool({
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
  });

  const weatherForecast = await callTool(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    currentWeatherTool,
    OpenAIChatFunctionPrompt.forTool({
      messages: [OpenAIChatMessage.user("What's the weather like in Boston?")],
    })
  );

  console.log(JSON.stringify(weatherForecast, null, 2));
})();
