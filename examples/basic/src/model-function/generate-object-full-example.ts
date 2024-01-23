import dotenv from "dotenv";
import { zodSchema, generateObject, openai } from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const { value, metadata, rawResponse } = await generateObject({
    model: openai
      .ChatTextGenerator({
        model: "gpt-3.5-turbo",
        temperature: 0,
        maxGenerationTokens: 2000,
      })
      .asFunctionCallObjectGenerationModel({
        fnName: "generateCharacter",
        fnDescription: "Generate character descriptions.",
      })
      .withInstructionPrompt(),

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

    prompt: {
      instruction:
        "Generate 3 character descriptions for a fantasy role playing game.",
    },

    fullResponse: true,
  });

  console.log(JSON.stringify(value, null, 2));
}

main().catch(console.error);
