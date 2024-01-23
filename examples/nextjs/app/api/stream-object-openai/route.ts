import {
  ObjectStreamResponse,
  jsonObjectPrompt,
  openai,
  streamObject,
} from "modelfusion";
import { itinerarySchema } from "../../stream-object-openai/itinerarySchema";

export const runtime = "edge";

export async function POST(req: Request) {
  const { destination, lengthOfStay } = await req.json();

  const objectStream = await streamObject({
    model: openai
      .ChatTextGenerator({
        model: "gpt-4-1106-preview",
        maxGenerationTokens: 2500,
      })
      .asObjectGenerationModel(jsonObjectPrompt.instruction()),

    schema: itinerarySchema,

    prompt: {
      system:
        "You help planning travel itineraries. " +
        "Respond to the users' request with a list of the best stops to make in their destination.",

      instruction: `I am planning a trip to ${destination} for ${lengthOfStay} days.`,
    },
  });

  return new ObjectStreamResponse(objectStream);
}
