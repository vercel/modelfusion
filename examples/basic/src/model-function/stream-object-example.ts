import dotenv from "dotenv";
import { zodSchema, openai, streamObject } from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const objectStream = await streamObject({
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
      .withTextPrompt(),

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

  for await (const { partialObject } of objectStream) {
    console.clear();
    console.log(partialObject);
  }
}

main().catch(console.error);
