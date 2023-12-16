import dotenv from "dotenv";
import {
  ChatMLPrompt,
  zodSchema,
  jsonStructurePrompt,
  ollama,
  streamStructure,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const structureStream = await streamStructure(
    ollama
      .TextGenerator({
        model: "openhermes2.5-mistral",
        maxGenerationTokens: 1024,
        temperature: 0,
        format: "json",
        raw: true,
        stopSequences: ["\n\n"], // prevent infinite generation
      })
      .withTextPrompt()
      .withPromptTemplate(ChatMLPrompt.instruction())
      .asStructureGenerationModel(
        jsonStructurePrompt((instruction: string, schema) => ({
          system:
            "JSON schema: \n" +
            JSON.stringify(schema.getJsonSchema()) +
            "\n\n" +
            "Respond only using JSON that matches the above schema.",
          instruction,
        }))
      ),

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
