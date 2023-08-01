import {
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAIChatResponseFormat,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const model = new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 500,
  });

  const deltas = await model.callAPI(
    [
      OpenAIChatMessage.system("You are a story writer. Write a story about:"),
      OpenAIChatMessage.user("A robot learning to love"),
    ],
    {
      responseFormat: OpenAIChatResponseFormat.deltaIterable,
      settings: {
        functionCall: {
          name: "exampleFunction",
        },
        functions: [
          {
            name: "exampleFunction",
            description: "An example function",
            parameters: {
              type: "object",
              properties: {
                exampleParameter: {
                  type: "string",
                  description: "An example parameter",
                },
              },
              required: ["exampleParameter"],
            },
          },
        ],
      },
    }
  );

  for await (const delta of deltas) {
    if (delta?.type === "error") {
      throw delta.error;
    }

    console.log(JSON.stringify(delta?.fullDelta[0].function_call ?? {}));
  }
})();
