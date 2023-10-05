import {
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAIChatResponseFormat,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const model = new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxCompletionTokens: 500,
  });

  const deltas = await model.callAPI(
    [
      OpenAIChatMessage.system("You are a story writer. Write a story about:"),
      OpenAIChatMessage.user("A robot learning to love"),
    ],
    {
      responseFormat: OpenAIChatResponseFormat.structureDeltaIterable,
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
    }
  );

  for await (const delta of deltas) {
    if (delta?.type === "error") {
      throw delta.error;
    }

    console.log(delta.valueDelta);
  }
}

main().catch(console.error);
