import {
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAIChatResponseFormat,
} from "ai-utils.js";
import dotenv from "dotenv";

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
  const response = await model.callAPI(
    [OpenAIChatMessage.user("What's the weather like in Boston?")],
    {
      responseFormat: OpenAIChatResponseFormat.json,
      settings: {
        functionCall: "auto",
        functions: [
          {
            name: "getCurrentWeather",
            description: "Get the current weather in a given location",
            parameters: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description: "The city and state, e.g. San Francisco, CA",
                },
                unit: { type: "string", enum: ["celsius", "fahrenheit"] },
              },
              required: ["location"],
            },
          },
        ],
      },
    }
  );

  const message = response.choices[0].message;

  // Step 2, check if the model wants to call a function
  if (message.function_call != null) {
    const functionName = message.function_call.name;

    // Step 3, call the function
    // Note: the JSON response from the model may not be valid JSON
    const { location, unit } = JSON.parse(message.function_call.arguments);
    const functionResponse = getCurrentWeather(location, unit);

    // Step 4, send model the info on the function call and function response
    const secondResponse = await model.callAPI(
      [
        OpenAIChatMessage.user("What's the weather like in Boston?"),
        OpenAIChatMessage.functionCall(message.content, message.function_call),
        OpenAIChatMessage.functionResult(
          functionName,
          JSON.stringify(functionResponse)
        ),
      ],
      { responseFormat: OpenAIChatResponseFormat.json }
    );

    console.log(secondResponse.choices[0].message.content!);
  }
})();
