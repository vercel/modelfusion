import dotenv from "dotenv";
import {
  StructureFromTextGenerationModel,
  ZodSchema,
  ZodStructureDefinition,
  generateStructure,
  ollama,
  parseJSON,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const heros = new ZodSchema(
    z.array(
      z.object({
        name: z.string().describe("The name of the hero"),
        race: z
          .string()
          .describe("The race of the hero, e.g. human, elf, dwarf, etc."),
        class: z
          .string()
          .describe("The class of the hero, e.g. warrior, mage, etc."),
        age: z.number().int().positive().describe("The age of the hero"),
        gender: z.string().describe("The gender of the hero"),
        backstory: z.string().describe("The backstory of the hero"),
      })
    )
  );

  const result = await generateStructure(
    new StructureFromTextGenerationModel({
      model: ollama.TextGenerator({
        model: "mistral",
        maxCompletionTokens: 1024,
        format: "json",
        raw: true,
        temperature: 0,
      }),
      format: {
        createPrompt: (instruction, structure) => {
          return (
            "Respond using JSON. Adhere to this JSON schema: \n" +
            JSON.stringify(structure.schema.getJsonSchema()) +
            "\n\n" +
            instruction
          );
        },
        extractStructure: (response) => parseJSON({ text: response }),
      },
    }),
    new ZodStructureDefinition({
      schema: heros,
      name: "heros",
      description: "Generated heros",
    }),
    "Generate 3 character descriptions for a fantasy role playing game. "
  );

  console.log(result);
}

main().catch(console.error);
