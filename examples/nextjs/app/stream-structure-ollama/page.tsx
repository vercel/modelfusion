"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PartialDeep } from "type-fest";
import {
  jsonStructurePrompt,
  ollama,
  streamStructure,
  zodSchema,
} from "modelfusion";
import React, { useState } from "react";
import { z } from "zod";

const itinerarySchema = z.array(
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
);

type Itinerary = PartialDeep<
  z.infer<typeof itinerarySchema>,
  { recurseIntoArrays: true }
>;

export default function () {
  const [destination, setDestination] = useState("");
  const [lengthOfStay, setLengthOfStay] = useState("");

  const [itinerary, setItinerary] = useState<Itinerary>([]);

  const handleGenerateItinerary = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const stream = await streamStructure({
      model: ollama
        .ChatTextGenerator({
          model: "mixtral",
          maxGenerationTokens: 2500,
        })
        .asStructureGenerationModel(jsonStructurePrompt.instruction()),

      schema: zodSchema(
        z.object({
          days: itinerarySchema,
        })
      ),

      prompt: {
        system:
          "You help planning travel itineraries. " +
          "Respond to the users' request with a list of the best stops to make in their destination." +
          "The stops for each day should be in the order they should be visited.",

        instruction: `I am planning a trip to ${destination} for ${lengthOfStay} days.`,
      },
    });

    for await (const part of stream) {
      if (part.days != null) {
        setItinerary(part.days);
      }
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
            onChange={(e) => setLengthOfStay(e.target.value)}
          />
        </div>
        <Button className="w-full" type="submit">
          Generate Itinerary
        </Button>
      </form>
      {itinerary.length > 0 && <ItineraryComponent itinerary={itinerary} />}
    </div>
  );
}

const ItineraryComponent = ({ itinerary }: { itinerary: Itinerary }) => (
  <div className="mt-8">
    <h2 className="text-xl font-bold mb-4">Your Itinerary</h2>
    <div className="space-y-4">
      {itinerary.map(
        (day, index) =>
          day != null && (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-bold">{day.theme ?? ""}</h3>

              {day.activities?.map(
                (activity, index) =>
                  activity != null && (
                    <div key={index} className="mt-4">
                      <h4 className="font-bold">{activity.name ?? ""}</h4>
                      <p className="text-gray-500">
                        {activity.description ?? ""}
                      </p>
                      <p className="text-sm text-gray-400">{`Duration: ${activity.duration ?? ""} hours`}</p>
                    </div>
                  )
              )}
            </div>
          )
      )}
    </div>
  </div>
);
