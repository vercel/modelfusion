import dotenv from "dotenv";
import {
  StructureFromTextStreamingModel,
  ZodSchema,
  ollama,
  parseJSON,
  setGlobalFunctionLogging,
  streamStructure,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

setGlobalFunctionLogging("detailed-object");

async function main() {
  const heros = new ZodSchema(
    z.object({
      heros: z.array(
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
      ),
    })
  );

  const structureStream = await streamStructure(
    new StructureFromTextStreamingModel({
      model: ollama.TextGenerator({
        model: "openhermes2.5-mistral",
        maxCompletionTokens: 1024,
        format: "json",
        raw: true,
        temperature: 0,
      }),
      format: {
        createPrompt: (instruction, schema) =>
          "JSON schema: \n" +
          JSON.stringify(schema.getJsonSchema()) +
          "\n\n" +
          "Respond using JSON that matches the above schema:\n" +
          instruction,
        extractStructure: (response) => parseJSON({ text: response }),
      },
    }),
    heros,
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
