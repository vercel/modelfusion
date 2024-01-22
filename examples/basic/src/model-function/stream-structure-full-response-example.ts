import dotenv from "dotenv";
import { zodSchema, openai, streamStructure } from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const { structureStream, structurePromise, metadata } = await streamStructure(
    {
      model: openai
        .ChatTextGenerator({
          model: "gpt-3.5-turbo",
          temperature: 0,
          maxGenerationTokens: 2000,
        })
        .asFunctionCallStructureGenerationModel({
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

      fullResponse: true,
    }
  );

  for await (const {
    partialStructure,
    partialText,
    textDelta,
  } of structureStream) {
    process.stdout.write(textDelta);
  }

  const structure = await structurePromise;

  console.clear();
  console.log("FINAL STRUCTURE");
  console.log(structure);
}

main().catch(console.error);
