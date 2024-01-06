import {
  generateStructure,
  jsonStructurePrompt,
  ollama,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

async function main() {
  const structure = await generateStructure(
    ollama
      .ChatTextGenerator({
        model: "openhermes2.5-mistral",
        maxGenerationTokens: 1024,
        temperature: 0,
      })
      .asStructureGenerationModel(jsonStructurePrompt.text()),

    zodSchema(
      z.object({
        characters: z.array(
          z.object({
            name: z.string(),
            class: z
              .string()
              .describe("Character class, e.g. warrior, mage, or thief."),
            description: z.string(),
          })
        ),
      })
    ),

    "Generate 3 character descriptions for a fantasy role playing game. "
  );

  console.log(structure.characters);
}

main().catch(console.error);
