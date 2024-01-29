import {
  ObjectGeneratorTool,
  createInstructionPrompt,
  jsonObjectPrompt,
  jsonToolCallPrompt,
  llamacpp,
  runTool,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

const enemyGenerator = new ObjectGeneratorTool({
  name: "enemies",
  description: "Generates a list of enemies.",

  parameters: zodSchema(
    z.object({
      type: z
        .string()
        .describe("The type of the enemy, e.g. human, orc, elf..."),
      numberOfOpponents: z.number(),
      location: z.string().describe("The location of the encounter."),
    })
  ),

  objectSchema: zodSchema(
    z.array(
      z.object({
        name: z.string(),
        species: z
          .string()
          .describe(
            "The species of the enemy, e.g. human, orc, elf, wolf, bear..."
          ),
        class: z
          .string()
          .describe("Character class, e.g. warrior, mage, thief...")
          .optional(),
        description: z.string().describe("How the character looks like."),
        weapon: z
          .string()
          .optional()
          .describe("The weapon the character uses. Optional."),
      })
    )
  ),

  model: llamacpp
    .CompletionTextGenerator({
      // run https://huggingface.co/TheBloke/Mixtral-8x7B-Instruct-v0.1-GGUF with llama.cpp
      promptTemplate: llamacpp.prompt.ChatML,
      temperature: 0.5,
    })
    .asObjectGenerationModel(jsonObjectPrompt.instruction()),

  prompt: createInstructionPrompt(
    async ({ type, numberOfOpponents, location }) => ({
      system:
        "You generate enemies for heroes in a fantasy role-playing game set in a medieval fantasy world. " +
        "The list of enemies should be limited to a single encounter. " +
        "The enemy group must be consistent, i.e. it must make sense for the enemies to appear together.",

      instruction: `Generate ${numberOfOpponents} ${type} enemies that the heroes encounter in ${location}.`,
    })
  ),
});

async function main() {
  const { tool, toolCall, args, ok, result } = await runTool({
    model: llamacpp
      .CompletionTextGenerator({
        // run https://huggingface.co/TheBloke/Mixtral-8x7B-Instruct-v0.1-GGUF with llama.cpp
        promptTemplate: llamacpp.prompt.ChatML,
        temperature: 0.7,
      })
      .withInstructionPrompt()
      .asToolCallGenerationModel(jsonToolCallPrompt.text()),

    tool: enemyGenerator,
    prompt:
      "The heros enter a dark cave. They hear a noise. They see something moving in the shadows.",
    // "The heros enter the backroom of the tavern. They see a group of people sitting at a table.",
    // "The heros are resting in the forest. They hear a noise. They see something moving between the trees.",
  });

  console.log(`Tool call:`, toolCall);
  console.log(`Tool:`, tool);
  console.log(`Arguments:`, args);
  console.log(`Ok:`, ok);
  console.log(`Result or Error:`, result);
}

main().catch(console.error);
