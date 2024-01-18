import {
  generateStructure,
  jsonStructurePrompt,
  ollama,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

const listCityDestinations = (country: string) =>
  generateStructure({
    model: ollama
      .ChatTextGenerator({
        model: "nous-hermes2-mixtral",
        temperature: 0,
      })
      .asStructureGenerationModel(jsonStructurePrompt.text()),

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
