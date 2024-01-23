import { jsonObjectPrompt, ollama, streamObject, zodSchema } from "modelfusion";
import { z } from "zod";

async function main() {
  const { objectStream, objectPromise } = await streamObject({
    model: ollama
      .ChatTextGenerator({
        model: "openhermes2.5-mistral",
        maxGenerationTokens: 1024,
        temperature: 0,
      })
      .asObjectGenerationModel(jsonObjectPrompt.text()),

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
  });

  for await (const { partialObject } of objectStream) {
    console.clear();
    console.log(partialObject);
  }

  const object = await objectPromise;

  console.clear();
  console.log("FINAL OBJEcT");
  console.log(object);
}

main().catch(console.error);
