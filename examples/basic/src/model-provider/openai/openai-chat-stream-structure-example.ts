import dotenv from "dotenv";
import {
  jsonStructurePrompt,
  openai,
  streamStructure,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const structureStream = await streamStructure({
    model: openai
      .ChatTextGenerator({
        model: "gpt-4-1106-preview",
        temperature: 0,
        maxGenerationTokens: 1024,
      })
      .asStructureGenerationModel(jsonStructurePrompt.text()),

    schema: zodSchema(
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

    prompt:
      "Generate 3 character descriptions for a fantasy role playing game.",
  });

  for await (const partialStructure of structureStream) {
    console.clear();
    console.log(partialStructure);
  }
}

main().catch(console.error);
