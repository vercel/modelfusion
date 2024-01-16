import dotenv from "dotenv";
import {
  generateStructure,
  jsonStructurePrompt,
  llamacpp,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

/**
 * Ask an LLM to output well-represented information (that is unlikely to be hallucinated)
 * in a structured format.
 */
const listCityDestinations = (country: string) =>
  generateStructure({
    model: llamacpp
      .CompletionTextGenerator({
        // run Mistral or Mixtral instruct model with llama.cpp
        promptTemplate: llamacpp.prompt.Mistral,
        temperature: 0,
      })
      .asStructureGenerationModel(jsonStructurePrompt.text()),

    schema: zodSchema(
      z.array(
        z.object({
          city: z.string(),
          region: z.string(),
          description: z.string(),
        })
      )
    ),

    prompt:
      `List 5 city destinations in ${country} for weekend trips. ` +
      "Describe in 1 sentence what is unique and interesting about each destination.",
  });

async function main() {
  console.log(await listCityDestinations("France"));
}

main().catch(console.error);
