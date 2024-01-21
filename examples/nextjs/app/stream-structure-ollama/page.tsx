"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Itinerary, useItinerary } from "./useItinerary";

export default function () {
  const [destination, setDestination] = useState("");
  const [lengthOfStay, setLengthOfStay] = useState("");

  const { isGeneratingItinerary, generateItinerary, itinerary } =
    useItinerary();

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        City Travel Itinerary Planner
      </h1>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          generateItinerary({ destination, lengthOfStay });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            placeholder="Enter your destination"
            required
            value={destination}
            disabled={isGeneratingItinerary}
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
            disabled={isGeneratingItinerary}
            onChange={(e) => setLengthOfStay(e.target.value)}
          />
        </div>
        <Button
          className="w-full"
          type="submit"
          disabled={isGeneratingItinerary}
        >
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
