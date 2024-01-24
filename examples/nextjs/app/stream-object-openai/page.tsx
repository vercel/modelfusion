"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ItineraryView } from "./ItineraryView";
import { useItinerary } from "./useItinerary";

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

      <ItineraryView itinerary={itinerary} />
    </div>
  );
}
