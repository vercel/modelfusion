import { StructureStreamFromResponse } from "modelfusion";
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
        const response = await fetch("/api/stream-structure-openai", {
          method: "POST",
          body: JSON.stringify({ destination, lengthOfStay }),
        });

        const stream = StructureStreamFromResponse<Itinerary>({
          response,
        });

        for await (const partialStructure of stream) {
          setItinerary(partialStructure);
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
