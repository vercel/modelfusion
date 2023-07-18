import {
  OpenAIChatAutoFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  generateJson,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

(async () => {
  const query = "What's the weather like in Boston?";
  // const query = "Where does Kevin work?";
  // const query = "Tell me something random.";

  const json = await generateJson(
    new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
    new OpenAIChatAutoFunctionPrompt({
      messages: [OpenAIChatMessage.user(query)],
      fns: {
        getCurrentWeather: {
          description: "Get the current weather in a given location",
          parameters: z.object({
            location: z
              .string()
              .describe("The city and state, e.g. San Francisco, CA"),
            unit: z.enum(["celsius", "fahrenheit"]).optional(),
          }),
        },
        getContactInformation: {
          description: "Get the contact information for a given person",
          parameters: z.object({
            name: z.string().describe("The name of the person"),
          }),
        },
      },
    })
  );

  switch (json.fnName) {
    case "getCurrentWeather": {
      const { location, unit } = json.value;
      console.log("getCurrentWeather", location, unit);
      break;
    }

    case "getContactInformation": {
      const { name } = json.value;
      console.log("getContactInformation", name);
      break;
    }

    case null: {
      console.log("No function call. Generated text: ", json.value);
    }
  }
})();
