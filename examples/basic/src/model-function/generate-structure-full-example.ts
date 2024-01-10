import dotenv from "dotenv";
import { zodSchema, generateStructure, openai } from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const { structure, metadata, rawResponse } = await generateStructure(
    openai
      .ChatTextGenerator({
        model: "gpt-3.5-turbo",
        temperature: 0,
        maxGenerationTokens: 2000,
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

    { instruction: "Generate 3 character descriptions for a fantasy role playing game." },
    
    { fullResponse: true }
  );

  console.log(JSON.stringify(structure, null, 2));
}

main().catch(console.error);
