import { parseStructureStreamResponse } from "modelfusion";
import { useCallback, useState } from "react";
import { Itinerary } from "./itinerarySchema";

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
        await parseStructureStreamResponse<Itinerary>({
          response: await fetch("/api/stream-structure-openai", {
            method: "POST",
            body: JSON.stringify({ destination, lengthOfStay }),
          }),
          onChunk: setItinerary,
        });
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
