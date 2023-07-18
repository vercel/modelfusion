import {
  OpenAIChatAutoFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  generateJson,
  generateText,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// example from https://platform.openai.com/docs/guides/gpt/function-calling
(async () => {
  function getCurrentWeather(location: string, unit: string = "fahrenheit") {
    return {
      location,
      temperature: "72",
      unit,
      forecast: ["sunny", "windy"],
    };
  }

  const model = new OpenAIChatModel({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
  });

  // Step 1, send model the user query and what functions it has access to
  const response = await generateJson(
    model,
    new OpenAIChatAutoFunctionPrompt({
      messages: [OpenAIChatMessage.user("What's the weather like in Boston?")],
      fn: {
        name: "getCurrentWeather",
        description: "Get the current weather in a given location",
        parameters: z.object({
          location: z
            .string()
            .describe("The city and state, e.g. San Francisco, CA"),
          unit: z.enum(["celsius", "fahrenheit"]).optional(),
        }),
      },
    })
  );

  // Step 2, check if the model wants to call a function
  if (response.fnName === "getCurrentWeather") {
    // Step 3, call the function
    const { location, unit } = response.value;
    const functionResponse = getCurrentWeather(location, unit);

    // Step 4, send model the info on the function call and function response
    const secondResponse = await generateText(model, [
      OpenAIChatMessage.user("What's the weather like in Boston?"),
      OpenAIChatMessage.functionCall(
        response.fnName,
        JSON.stringify(functionResponse)
      ),
    ]);

    console.log(secondResponse);
  }
})();
