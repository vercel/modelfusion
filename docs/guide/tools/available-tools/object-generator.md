---
sidebar_position: 5
title: Object Generator (built-in)
---

# Object Generator Tool

The object generator is a built-in tool that generates an object from a JSON schema using the [generateObject](/guide/function/generate-object) model function.

It is useful to create synthetic data with a specific schema and a separate prompt, e.g. for testing, mocking, and fictional writing (RPGs, stories, etc.).

## Usage

When setting up a object generator too, you need to configure the following:

- `name`: The name of the tool. Optional, helps the calling model.
- `description`: The description of the tool. Optional, helps the calling model.
- `parameters`: A schema that describes the parameters of the tool. Required.
- `objectSchema`: A schema that describes the object that will be generated. Required.
- `model`: A object generation model that generates the object. Required.
- `prompt`: A prompt function that generates the prompt for the model. The resulting prompt needs to match what is expected by the model. Required.

### Example

This example generates a list of enemies for a fantasy role-playing game. It uses a [llama.cpp](/integration/model-provider/llamacpp) model to generate the enemies. You can switch the model to any other object generation model, e.g. a model from [OpenAI](/integration/model-provider/openai).

#### Enemy Generator Tool

```ts
import {
  ObjectGeneratorTool,
  createInstructionPrompt,
  jsonObjectPrompt,
  llamacpp,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

const enemyGenerator = new ObjectGeneratorTool({
  name: "enemies",
  description: "Generates a list of enemies.",

  parameters: zodSchema(
    z.object({
      groupDescription: z
        .string()
        .describe(
          "Description of the enemy, e.g. 'group of bandits', 'pack of wolves', 'a tall bear', 'a powerful lich', ..."
        ),
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
            "The species of the enemy, e.g. human, orc, elf, wolf, bear, skeleton..."
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
      temperature: 1.2,
    })
    .asObjectGenerationModel(jsonObjectPrompt.instruction()),

  prompt: createInstructionPrompt(
    async ({ groupDescription, numberOfOpponents, location }) => ({
      system:
        "You generate enemies for heroes in a fantasy role-playing game set in a medieval fantasy world. " +
        "The list of enemies should be limited to a single encounter. " +
        "The enemy group must be consistent, i.e. it must make sense for the enemies to appear together.",

      instruction: `Generate ${numberOfOpponents} enemies from ${groupDescription} that the heroes encounter in ${location}.`,
    })
  ),
});
```

#### Using the Enemy Generator Tool

You can use the tool with `runTool` or `executeTool`:

```ts
import { jsonToolCallPrompt, runTool, llamacpp } from "modelfusion";
import { z } from "zod";

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
  // "The heros enter the abandoned graveyard. The moon is full. They see something moving slowly between the graves.",
});

console.log(`Tool call:`, toolCall);
console.log(`Tool:`, tool);
console.log(`Arguments:`, args);
console.log(`Ok:`, ok);
console.log(`Result or Error:`, result);
```
