import dotenv from "dotenv";
import { zodSchema, generateStructure, openai } from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const { structure, metadata, response } = await generateStructure(
    openai
      .ChatTextGenerator({
        model: "gpt-3.5-turbo",
        temperature: 0,
        maxCompletionTokens: 2000,
      })
      .asFunctionCallStructureGenerationModel({
        fnName: "generateCharacter",
        fnDescription: "Generate character descriptions.",
      })
      .withInstructionPrompt(),

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

    {
      system:
        "You are a sentiment evaluator. " +
        "Analyze the sentiment of the following product review:",
      instruction:
        "After I opened the package, I was met by a very unpleasant smell " +
        "that did not disappear even after washing. Never again!",
    },

    { fullResponse: true }
  );

  console.log(JSON.stringify(structure, null, 2));
}

main().catch(console.error);
