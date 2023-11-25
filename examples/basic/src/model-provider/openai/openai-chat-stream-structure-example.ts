import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  ZodStructureDefinition,
  openai,
  streamStructure,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const structureStream = await streamStructure(
    openai.ChatTextGenerator({
      model: "gpt-3.5-turbo",
      temperature: 0,
      maxCompletionTokens: 2000,
    }),
    new ZodStructureDefinition({
      name: "generateCharacter" as const,
      description: "Generate character descriptions.",
      schema: z.object({
        characters: z.array(
          z.object({
            name: z.string(),
            class: z
              .string()
              .describe("Character class, e.g. warrior, mage, or thief."),
            description: z.string(),
          })
        ),
      }),
    }),
    [
      OpenAIChatMessage.user(
        "Generate 3 character descriptions for a fantasy role playing game."
      ),
    ]
  );

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
