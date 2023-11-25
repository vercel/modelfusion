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
const sentiment = await generateStructure(
  openai
    .ChatTextGenerator({
      model: input.model,
      temperature: 0,
      maxCompletionTokens: 50,
    })
    .asFunctionCallStructureGenerationModel({
      fnName: "sentiment",
      fnDescription: "Write the sentiment analysis",
    })
    .withInstructionPrompt(),

  new ZodSchema(
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

#### OpenAI chat model

```ts
const structureStream = await streamStructure(
  openai.ChatTextGenerator({
    model: "gpt-3.5-turbo",
    temperature: 0,
    maxCompletionTokens: 2000,
  }),
  new ZodStructureDefinition({
    name: "generateCharacter",
    description: "Generate character descriptions.",
    schema: z.object({
      characters: z.array(
        z.object({
          name: z.string(),
          class: z
            .string()
            .describe("Character class, e.g. warrior, mage, or thief."),
          description: z.string(),
        })
      ),
    }),
  }),
  [
    OpenAIChatMessage.user(
      "Generate 3 character descriptions for a fantasy role playing game."
    ),
  ]
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
