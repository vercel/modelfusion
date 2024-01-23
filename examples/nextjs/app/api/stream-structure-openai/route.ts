import {
  StructureStreamResponse,
  jsonStructurePrompt,
  openai,
  streamStructure,
} from "modelfusion";
import { itinerarySchema } from "../../stream-structure-openai/itinerarySchema";

export const runtime = "edge";

export async function POST(req: Request) {
  const { destination, lengthOfStay } = await req.json();

  const structureStream = await streamStructure({
    model: openai
      .ChatTextGenerator({
        model: "gpt-4-1106-preview",
        maxGenerationTokens: 2500,
      })
      .asStructureGenerationModel(jsonStructurePrompt.instruction()),

    schema: itinerarySchema,

    prompt: {
      system:
        "You help planning travel itineraries. " +
        "Respond to the users' request with a list of the best stops to make in their destination.",

      instruction: `I am planning a trip to ${destination} for ${lengthOfStay} days.`,
    },
  });

  return new StructureStreamResponse(structureStream);
}
