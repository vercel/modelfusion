---
sidebar_position: 12
---

# Generate Object

Generates a typed object that matches a schema. The object can be generated in one pass or streamed as a sequence of partial results.

First, a language model is invoked with a schema and a prompt. When possible and required by the prompt, the model output is restricted, for example, to JSON. Then the model output is parsed and type inference is executed. The result is a typed object that matches the schema.

You can use this for e.g. the following tasks:

- information generation, e.g. generating a list of characters for a role playing game
- [information extraction](/tutorial/information-extraction), e.g. extracting structured information from websites
- classification, e.g. [sentiment analysis](/tutorial/sentiment-analysis).

## Usage

First you need to create an object generation model. Such a model can be derived from a text chat model or a completion model, for example.

### ObjectGenerationModel

[ObjectGenerationModel API](/api/interfaces/ObjectGenerationModel)

#### OpenAI chat model with function calls

You can create an object generation model by using function calls on an OpenAI chat model. You need to pass the function name and optionally a function description to `asFunctionCallObjectGenerationModel` when deriving the object generation model.

```ts
import { openai } from "modelfusion";

const model = openai
  .ChatTextGenerator({
    model: "gpt-4-1106-preview",
    temperature: 0,
    maxGenerationTokens: 50,
  })
  .asFunctionCallObjectGenerationModel({ fnName: "sentiment" })
  .withInstructionPrompt(); // optional, required in example below
```

#### OpenAI chat model with JSON output

You can also use the JSON output of OpenAI chat models to generate an object. The `jsonObjectPrompt` automatically restricts the output to JSON.

```ts
import { jsonObjectPrompt, openai } from "modelfusion";

const model = openai
  .ChatTextGenerator({
    model: "gpt-4-1106-preview",
    maxGenerationTokens: 1024,
    temperature: 0,
  })
  .asObjectGenerationModel(jsonObjectPrompt.instruction());
```

#### Ollama chat model with JSON output

You can also use the JSON output of [Ollama](/integration/model-provider/ollama) chat models to generate an object. The `jsonObjectPrompt` automatically restricts the output to JSON.

:::note
When using Ollama for object generation, it is important to choose a model that is capable of creating the object that you want. I had good results with `openhermes2.5-mistral` and `mixtral`, for example, but this depends on your use case.
:::

```ts
import { jsonObjectPrompt, ollama } from "modelfusion";

const model = ollama
  .ChatTextGenerator({
    model: "openhermes2.5-mistral",
    maxGenerationTokens: 1024,
    temperature: 0,
  })
  .asObjectGenerationModel(jsonObjectPrompt.instruction());
```

#### Llama.cpp JSON grammar

You can generate objects with [Llama.cpp](/integration/model-provider/llamacpp) models. The `jsonObjectPrompt` automatically restricts the output to your JSON schema using a GBNF grammar.

:::note
When using Llama.cpp for object generation, it is important to choose a model that is capable of creating the object that you want. I had good results with `openhermes2.5-mistral` and `mixtral`, for example, but this depends on your use case.
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
  .asObjectGenerationModel(jsonObjectPrompt.text());
```

### jsonObjectPrompt

[jsonObjectPrompt API](/api/modules#jsonobjectprompt)

`jsonObjectPrompt` is a helper for getting language models to generate JSON output. It injects a JSON schema and instructions to generate JSON into your prompt. When possible, it restricts the model output to JSON.

It allows you to create text or instruction prompts. You can pass a custom schema prefix and suffix.

- `jsonObjectPrompt.text()`
- `jsonObjectPrompt.instruction()`

### generateObject

[generateObject API](/api/modules#generateobject)

#### Example: Sentiment analysis

```ts
import { openai, zodSchema, generateObject } from "modelfusion";
import { z } from "zod";

const sentiment = await generateObject({
  model,

  schema: zodSchema(
    z.object({
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    })
  ),

  prompt: {
    system:
      "You are a sentiment evaluator. " +
      "Analyze the sentiment of the following product review:",
    instruction:
      "After I opened the package, I was met by a very unpleasant smell " +
      "that did not disappear even after washing. Never again!",
  },
});
```

### streamObject

[streamObject API](/api/modules#streamobject)

`streamObject` returns an async iterable over partial results.

:::note
The partial results are typed, but not validated. You can use your own logic to handle partial objects, e.g. with Zod `.deepPartial()`, to add validation.
:::

#### Example: RPG character generation

:::note
With most models, you need to have an object at the top level. If you want to produce arrays, you need to use a property in that object. For example, you can use a `characters` property to generate an array of characters.

When using Llama.cpp with a JSON array grammar, you can generate a top-level array and do not need to use a property.
:::

```ts
const objectStream = await streamObject({
  model,

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
});

for await (const { partialObject } of objectStream) {
  console.clear();
  console.log(partialObject);
}
```

#### Example: Full response with object promise

You can use the `fullResponse` property to get a full response with an additional promise to the fully typed and validated object.

```ts
const { objectStream, objectPromise, metadata } = await streamObject({
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

  prompt: "Generate 3 character descriptions for a fantasy role playing game.",

  fullResponse: true,
});

for await (const { partialObject } of objectStream) {
  console.clear();
  console.log(partialObject);
}

const object = await objectPromise;

console.clear();
console.log("FINAL OBJECT");
console.log(object);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Ollama](/integration/model-provider/ollama)
- [Llama.cpp](/integration/model-provider/llamacpp)
