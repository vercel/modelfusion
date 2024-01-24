import dotenv from "dotenv";
import {
  generateObject,
  jsonObjectPrompt,
  openai,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

/**
 * Ask an LLM to output well-represented information (that is unlikely to be hallucinated)
 * in a structured format.
 */
const listCityDestinations = (country: string) =>
  generateObject({
    model: openai
      .ChatTextGenerator({
        model: "gpt-4-1106-preview",
        temperature: 0,
        maxGenerationTokens: 4096,
      })
      .asObjectGenerationModel(jsonObjectPrompt.text()),

    schema: zodSchema(
      z.object({
        destinations: z.array(
          z.object({
            city: z.string(),
            region: z.string(),
            description: z.string(),
          })
        ),
      })
    ),

    prompt:
      `List 5 city destinations in ${country} for weekend trips. ` +
      "Describe in 1 sentence what is unique and interesting about each destination.",
  });

async function main() {
  console.log(await listCityDestinations("France"));
}

main().catch(console.error);
