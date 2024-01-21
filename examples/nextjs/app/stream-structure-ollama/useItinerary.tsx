import {
  jsonStructurePrompt,
  ollama,
  streamStructure,
  zodSchema,
} from "modelfusion";
import { useState } from "react";
import { z } from "zod";

const itinerarySchema = zodSchema(
  z.object({
    days: z.array(
      z.object({
        theme: z.string(),
        activities: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            duration: z.number(),
          })
        ),
      })
    ),
  })
);

export type Itinerary = (typeof itinerarySchema._partialType)["days"];

export function useItinerary() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary>();

  const generateItinerary = async ({
    destination,
    lengthOfStay,
  }: {
    destination: string;
    lengthOfStay: string;
  }) => {
    setItinerary(undefined);
    setIsGenerating(true);

    try {
      const stream = await streamStructure({
        // Note: this is fine assuming Ollama runs locally and you are using it.
        // When you use e.g. OpenAI, you should not expose your API key in the client.
        model: ollama
          .ChatTextGenerator({
            model: "openhermes",
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

      for await (const part of stream) {
        setItinerary(part.days);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGeneratingItinerary: isGenerating,
    generateItinerary,
    itinerary,
  };
}
