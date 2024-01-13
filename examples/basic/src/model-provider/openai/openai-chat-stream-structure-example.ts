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

  for await (const part of structureStream) {
    if (!part.isComplete) {
      const unknownPartialStructure = part.value;
      console.log("partial value", unknownPartialStructure);
    } else {
      const fullyTypedStructure = part.value;
      console.log("final value", fullyTypedStructure);
    }
  }
}

main().catch(console.error);
