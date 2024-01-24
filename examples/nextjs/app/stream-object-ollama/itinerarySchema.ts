import { zodSchema } from "modelfusion";
import { z } from "zod";

export const itinerarySchema = zodSchema(
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

export type Itinerary = typeof itinerarySchema._partialType;
