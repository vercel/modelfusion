---
sidebar_position: 12
---

# Generate Structure

Generates a typed object that matches a schema. The object can be generated in one pass or streamed as a sequence of partial results.

First, a language model is invoked with a schema and a prompt. When possible and required by the prompt, the model output is restricted, for example, to JSON. Then the model output is parsed and type inference is executed. The result is a typed object that matches the schema.

You can use this for e.g. the following tasks:

- information generation, e.g. generating a list of characters for a role playing game
- [information extraction](/tutorial/tutorials/information-extraction), e.g. extracting structured information from websites
- classification, e.g. [sentiment analysis](/tutorial/tutorials/sentiment-analysis).

## Usage

First you need to create a structure generation model. Such a model can be derived from a text chat model or a completion model, for example.

### StructureGenerationModel

[StructureGenerationModel API](/api/interfaces/StructureGenerationModel)

#### OpenAI chat model with function calls

You can create a structure generation model by using function calls on an OpenAI chat model. You need to pass the function name and optionally a function description to `asFunctionCallStructureGenerationModel` when deriving the structure generation model.

```ts
import { openai } from "modelfusion";

const model = openai
  .ChatTextGenerator({
    model: "gpt-4-1106-preview",
    temperature: 0,
    maxGenerationTokens: 50,
  })
  .asFunctionCallStructureGenerationModel({ fnName: "sentiment" })
  .withInstructionPrompt(); // optional, required in example below
```

#### OpenAI chat model with JSON output

You can also use the JSON output of OpenAI chat models to generate a structure. The `jsonStructurePrompt` automatically restricts the output to JSON.

```ts
import { jsonStructurePrompt, openai } from "modelfusion";

const model = openai
  .ChatTextGenerator({
    model: "gpt-4-1106-preview",
    maxGenerationTokens: 1024,
    temperature: 0,
  })
  .asStructureGenerationModel(jsonStructurePrompt.instruction());
```

#### Ollama chat model with JSON output

You can also use the JSON output of [Ollama](/integration/model-provider/ollama) chat models to generate a structure. The `jsonStructurePrompt` automatically restricts the output to JSON.

:::note
When using Ollama for structure generation, it is important to choose a model that is capable of creating the structure that you want. I had good results with `openhermes2.5-mistral` and `mixtral`, for example, but this depends on your use case.
:::

```ts
import { jsonStructurePrompt, ollama } from "modelfusion";

const model = ollama
  .ChatTextGenerator({
    model: "openhermes2.5-mistral",
    maxGenerationTokens: 1024,
    temperature: 0,
  })
  .asStructureGenerationModel(jsonStructurePrompt.instruction());
```

#### Llama.cpp JSON grammar

You can generate structures with [Llama.cpp](/integration/model-provider/llamacpp) models. The `jsonStructurePrompt` automatically restricts the output to your JSON schema using a GBNF grammar.

:::note
When using Llama.cpp for structure generation, it is important to choose a model that is capable of creating the structure that you want. I had good results with `openhermes2.5-mistral` and `mixtral`, for example, but this depends on your use case.
:::

```ts
const model = llamacpp
  .CompletionTextGenerator({
    // run openhermes-2.5-mistral-7b.Q4_K_M.gguf in llama.cpp
    promptTemplate: llamacpp.prompt.ChatML,
    maxGenerationTokens: 1024,
    temperature: 0,
  })
  // automatically restrict the output to your schema using GBNF:
  .asStructureGenerationModel(jsonStructurePrompt.text());
```

### jsonStructurePrompt

[jsonStructurePrompt API](/api/modules#jsonstructureprompt)

`jsonStructurePrompt` is a helper for getting language models to generate structured JSON output. It injects a JSON schema and instructions to generate JSON into your prompt. When possible, it restricts the model output to JSON.

It allows you to create text or instruction prompts. You can pass a custom schema prefix and suffix.

- `jsonStructurePrompt.text()`
- `jsonStructurePrompt.instruction()`

### generateStructure

[generateStructure API](/api/modules#generatestructure)

#### Example: Sentiment analysis

```ts
import { openai, zodSchema, generateStructure } from "modelfusion";
import { z } from "zod";

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

### streamStructure

[streamStructure API](/api/modules#streamstructure)

`streamStructure` returns an async iterable over partial results.

The `value` property of the result contains the current value.
The `isComplete` flag of the result indicates whether result is complete.

For complete results, type inference is executed and `value` will be typed.
For partial results `value` is JSON of the type `unknown`.
You can do your own type inference on partial results if needed.

#### Example: RPG character generation

:::note
With most models, you need to have a JSON object as the top-level structure. If you want to produce arrays, you need to use a property in that object. For example, you can use a `characters` property to generate an array of characters.

When using Llama.cpp with a JSON array grammar, you can generate a top-level array and do not need to use a property.
:::

```ts
const structureStream = await streamStructure(
  model,
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
- [Llama.cpp](/integration/model-provider/llamacpp)
