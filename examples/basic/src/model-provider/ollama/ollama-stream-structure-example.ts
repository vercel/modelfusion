import dotenv from "dotenv";
import {
  ChatMLPromptFormat,
  ZodSchema,
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
        maxCompletionTokens: 1024,
        temperature: 0,
        format: "json",
        raw: true,
        stopSequences: ["\n\n"], // prevent streaming from running forever
      })
      .withPromptFormat(ChatMLPromptFormat.instruction())
      .asStructureStreamingModel(
        jsonStructurePrompt((instruction: string, schema) => ({
          system:
            "JSON schema: \n" +
            JSON.stringify(schema.getJsonSchema()) +
            "\n\n" +
            "Respond only using JSON that matches the above schema.",
          instruction,
        }))
      ),
    new ZodSchema(
      // note: the outer object with the "heros" property is required,
      // just passing in an array will produce results that don't match the schema
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
