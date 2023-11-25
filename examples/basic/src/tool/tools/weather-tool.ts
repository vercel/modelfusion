import { Tool, zodSchema } from "modelfusion";
import { z } from "zod";

export const weather = new Tool({
  name: "weather",
  description: "Get the weather at a location",

  parameters: zodSchema(
    z.object({
      zipCode: z
        .string()
        .min(5)
        .max(5)
        .describe("The zip code of the location."),
    })
  ),

  execute: async ({ zipCode }) => {
    // return a random weather condition:
    const conditions = ["sunny", "cloudy", "rainy", "snowy"];
    const randomIndex = Math.floor(Math.random() * conditions.length);
    return conditions[randomIndex];
  },
});
