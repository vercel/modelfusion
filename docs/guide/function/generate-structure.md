---
sidebar_position: 50
---

# Generate Structure

Generates a structure that matches a schema.
This is, for example, useful for [information extraction](/tutorial/tutorials/information-extraction)
and classification tasks (e.g. [sentiment analysis](/tutorial/tutorials/sentiment-analysis)). The structure can be generated in one pass or streamed.

## Usage

### generateStructure

[generateStructure API](/api/modules#generatestructure)

#### OpenAI chat model with function call

```ts
import { openai, zodSchema, generateStructure } from "modelfusion";
import { z } from "zod";

const model = openai
  .ChatTextGenerator({
    model: "gpt-3.5-turbo",
    temperature: 0,
    maxGenerationTokens: 50,
  })
  .asFunctionCallStructureGenerationModel({ fnName: "sentiment" })
  .withInstructionPrompt();

const sentiment = await generateStructure(
  model,
  zodSchema(
    z.object({
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    })
  ),
  {
    system:
      "You are a sentiment evaluator. " +
      "Analyze the sentiment of the following product review:",
    instruction:
      "After I opened the package, I was met by a very unpleasant smell " +
      "that did not disappear even after washing. Never again!",
  }
);
```

#### OpenAI JSON format

You can also use the JSON format of OpenAI to generate a structure.

```ts
const model = openai
  .ChatTextGenerator({
    model: "gpt-4-1106-preview",
    temperature: 0,
    maxGenerationTokens: 1024,
    responseFormat: { type: "json_object" }, // force JSON output
  })
  .asStructureGenerationModel(
    // Instruct the model to generate a JSON object that matches the given schema.
    jsonStructurePrompt((instruction: string, schema) => [
      OpenAIChatMessage.system(
        "JSON schema: \n" +
          JSON.stringify(schema.getJsonSchema()) +
          "\n\n" +
          "Respond only using JSON that matches the above schema."
      ),
      OpenAIChatMessage.user(instruction),
    ])
  );
```

#### Ollama OpenHermes 2.5

Structure generation is also possible with capable open-source models like [OpenHermes 2.5](https://huggingface.co/teknium/OpenHermes-2.5-Mistral-7B).

```ts
const model = ollama
  .TextGenerator({
    model: "openhermes2.5-mistral",
    maxGenerationTokens: 1024,
    temperature: 0,
    format: "json", // force JSON output
    raw: true, // prevent Ollama from adding its own prompts
    stopSequences: ["\n\n"], // prevent infinite generation
  })
  .withPromptTemplate(ChatMLPrompt.instruction())
  .asStructureGenerationModel(
    // Instruct the model to generate a JSON object that matches the given schema.
    jsonStructurePrompt((instruction: string, schema) => ({
      system:
        "JSON schema: \n" +
        JSON.stringify(schema.getJsonSchema()) +
        "\n\n" +
        "Respond only using JSON that matches the above schema.",
      instruction,
    }))
  );
```

### streamStructure

[streamStructure API](/api/modules#streamstructure)

`streamStructure` returns an async iterable over partial results.

The `value` property of the result contains the current value.
The `isComplete` flag of the result indicates whether result is complete.

For complete results, type inference is executed and `value` will be typed.
For partial results `value` is JSON of the type `unknown`.
You can do your own type inference on partial results if needed.

#### OpenAI chat model

```ts
const structureStream = await streamStructure(
  model, // see generateStructure examples
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
    instruction:
      "Generate 3 character descriptions for a fantasy role playing game.",
  }
);

for await (const part of structureStream) {
  if (!part.isComplete) {
    // use your own logic to handle partial structures, e.g. with Zod .deepPartial()
    // it depends on your application at which points you want to act on the partial structures
    const unknownPartialStructure = part.value;
    console.log("partial value", unknownPartialStructure);
  } else {
    // the final structure is fully typed:
    const fullyTypedStructure = part.value;
    console.log("final value", fullyTypedStructure);
  }
}
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Ollama](/integration/model-provider/ollama)
