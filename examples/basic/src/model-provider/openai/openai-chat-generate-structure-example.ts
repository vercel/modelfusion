import dotenv from "dotenv";
import {
  generateStructure,
  jsonStructurePrompt,
  openai,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const structure = await generateStructure(
    openai
      .ChatTextGenerator({
        model: "gpt-4-1106-preview",
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
