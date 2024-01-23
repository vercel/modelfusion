import { ObjectStreamFromResponse } from "modelfusion";
import { useCallback, useState } from "react";
import { Itinerary, itinerarySchema } from "./itinerarySchema";

export function useItinerary() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary>();

  const generateItinerary = useCallback(
    async ({
      destination,
      lengthOfStay,
    }: {
      destination: string;
      lengthOfStay: string;
    }) => {
      setItinerary(undefined);
      setIsGenerating(true);

      try {
        const response = await fetch("/api/stream-object-openai", {
          method: "POST",
          body: JSON.stringify({ destination, lengthOfStay }),
        });

        const stream = ObjectStreamFromResponse({
          schema: itinerarySchema,
          response,
        });

        for await (const { partialObject } of stream) {
          setItinerary(partialObject);
        }
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    isGeneratingItinerary: isGenerating,
    generateItinerary,
    itinerary,
  };
}
