import dotenv from "dotenv";
import {
  OllamaTextGenerationModel,
  StructureFromTextGenerationModel,
  ZodSchema,
  ZodStructureDefinition,
  generateStructure,
  parseJSON,
  setGlobalFunctionLogging,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

setGlobalFunctionLogging("detailed-object");

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
      model: new OllamaTextGenerationModel({
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
        extractStructure: (response) => {
          return parseJSON({ text: response, schema: heros });
        },
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
  // for await (const textPart of textStream) {
  //   process.stdout.write(textPart);
  // }
}

main().catch(console.error);
