"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  jsonStructurePrompt,
  ollama,
  streamStructure,
  zodSchema,
} from "modelfusion";
import React, { useState } from "react";
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

type Itinerary = (typeof itinerarySchema._partialType)["days"];

export default function () {
  const [destination, setDestination] = useState("");
  const [lengthOfStay, setLengthOfStay] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [itinerary, setItinerary] = useState<Itinerary>();

  const handleGenerateItinerary = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

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

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        City Travel Itinerary Planner
      </h1>
      <form className="space-y-4" onSubmit={handleGenerateItinerary}>
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            placeholder="Enter your destination"
            required
            value={destination}
            disabled={isGenerating}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="length-of-stay">Length of Stay (Days)</Label>
          <Input
            id="length-of-stay"
            placeholder="Enter the length of your stay (up to 7 days)"
            required
            type="number"
            min="1" // Minimum length of stay
            max="7" // Maximum length of stay
            value={lengthOfStay}
            disabled={isGenerating}
            onChange={(e) => setLengthOfStay(e.target.value)}
          />
        </div>
        <Button className="w-full" type="submit" disabled={isGenerating}>
          Generate Itinerary
        </Button>
      </form>
      {itinerary && <ItineraryView itinerary={itinerary} />}
    </div>
  );
}

const ItineraryView = ({ itinerary }: { itinerary: Itinerary }) => (
  <div className="mt-8">
    <h2 className="text-xl font-bold mb-4">Your Itinerary</h2>
    <div className="space-y-4">
      {itinerary?.map(
        (day, index) =>
          day && (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-bold">{day.theme ?? ""}</h3>

              {day.activities?.map(
                (activity, index) =>
                  activity != null && (
                    <div key={index} className="mt-4">
                      {activity.name && (
                        <h4 className="font-bold">{activity.name}</h4>
                      )}
                      {activity.description && (
                        <p className="text-gray-500">{activity.description}</p>
                      )}
                      {activity.duration && (
                        <p className="text-sm text-gray-400">{`Duration: ${activity.duration} hours`}</p>
                      )}
                    </div>
                  )
              )}
            </div>
          )
      )}
    </div>
  </div>
);
