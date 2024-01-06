import {
  ChatMLPrompt,
  jsonStructurePrompt,
  llamacpp,
  streamStructure,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

async function main() {
  const structureStream = await streamStructure(
    llamacpp
      .TextGenerator({
        // run openhermes-2.5-mistral-7b.Q4_K_M.gguf in llama.cpp
        maxGenerationTokens: 1024,
        temperature: 0,
        grammar: llamacpp.grammar.jsonArray, // force JSON array output
      })
      .withTextPromptTemplate(ChatMLPrompt.instruction()) // needed for jsonStructurePrompt.text()
      .asStructureGenerationModel(jsonStructurePrompt.text()),

    zodSchema(
      // With grammar.jsonArray, it is possible to output arrays as top level structures:
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

    "Generate 3 character descriptions for a fantasy role playing game. "
  );

  for await (const part of structureStream) {
    if (part.isComplete) {
      const fullyTypedStructure = part.value;
      console.log("final value", fullyTypedStructure);
    } else {
      const unknownPartialStructure = part.value;
      console.log("partial value", unknownPartialStructure);
    }
  }
}

main().catch(console.error);
