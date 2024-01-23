import {
  jsonObjectPrompt,
  llamacpp,
  streamObject,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

async function main() {
  const objectStream = await streamObject({
    model: llamacpp
      .CompletionTextGenerator({
        // run openhermes-2.5-mistral-7b.Q4_K_M.gguf in llama.cpp
        promptTemplate: llamacpp.prompt.ChatML,
        maxGenerationTokens: 1024,
        temperature: 0,
      })
      // automatically restrict the output to your schema using GBNF:
      .asObjectGenerationModel(jsonObjectPrompt.text()),

    schema: zodSchema(
      z.array(
        z.object({
          name: z.string(),
          class: z
            .string()
            .describe("Character class, e.g. warrior, mage, or thief."),
          description: z.string(),
        })
      )
    ),

    prompt:
      "Generate 3 character descriptions for a fantasy role playing game. ",
  });

  for await (const { partialObject } of objectStream) {
    console.clear();
    console.log(partialObject);
  }
}

main().catch(console.error);
