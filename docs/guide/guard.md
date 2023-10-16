---
sidebar_position: 18
---

# Guard

Guards can be used to implement retry on error, redacting and changing reponses, etc.

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/guard)

### Retry structure parsing on error

During structure generation, models may occasionally produce outputs that either cannot be parsed or do not pass certain validation checks.
With the [`fixStructure`](/api/modules/#fixstructure) guard, you can retry generating the structure with a modified input that includes the error message.

```ts
const result = await guard(
  (input) =>
    generateStructure(
      new OpenAIChatModel({
        // ...
      }),
      new ZodStructureDefinition({
        // ...
      }),
      input
    ),
  [
    // ...
  ],
  fixStructure({
    modifyInputForRetry: async ({ input, error }) => [
      ...input,
      OpenAIChatMessage.functionCall(null, {
        name: error.structureName,
        arguments: error.valueText,
      }),
      OpenAIChatMessage.user(error.message),
      OpenAIChatMessage.user("Please fix the error and try again."),
    ],
  })
);
```
