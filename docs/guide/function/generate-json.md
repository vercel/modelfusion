---
sidebar_position: 5
---

# Generate JSON

Generates JSON using a prompt and a structure.

## Usage

### generateJson

[generateJson API](/api/modules#generatejson)

Generates JSON for a single schema using a prompt.
The prompt format depends on the model.

#### OpenAI chat model

```ts
const { sentiment } = await generateJson(
  new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0,
    maxTokens: 50,
  }),
  {
    name: "sentiment",
    description: "Write the sentiment analysis",
    schema: z.object({
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    }),
  },
  OpenAIChatFunctionPrompt.forSchemaCurried([
    OpenAIChatMessage.system(
      "You are a sentiment evaluator. " +
        "Analyze the sentiment of the following product review:"
    ),
    OpenAIChatMessage.user(
      "After I opened the package, I was met by a very unpleasant smell " +
        "that did not disappear even after washing. Never again!"
    ),
  ])
);
```

### generateJsonOrText

[generateJsonOrText API](/api/modules#generatejsonortext)

Generates JSON or text for multiple schemas using a prompt.
The prompt format depends on the model.

#### OpenAI chat model

```ts
const { schema, value } = await generateJsonOrText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  [
    {
      name: "multiply" as const,
      description: "Multiply two numbers",
      schema: z.object({
        a: z.number().describe("The first number."),
        b: z.number().describe("The second number."),
      }),
    },
    {
      name: "sum" as const,
      description: "Sum two numbers",
      schema: z.object({
        a: z.number().describe("The first number."),
        b: z.number().describe("The second number."),
      }),
    },
  ],
  OpenAIChatFunctionPrompt.forSchemasCurried([
    OpenAIChatMessage.system(
      "You are a calculator. Evaluate the following expression:"
    ),
    OpenAIChatMessage.user("Multiply twelve with 10."),
  ])
);

switch (schema) {
  case null: {
    console.log(`TEXT: ${value}`);
    break;
  }

  case "multiply": {
    console.log(`MULTIPLY: ${value.a * value.b}`);
    break;
  }

  case "sum": {
    console.log(`SUM: ${value.a + value.b}`);
    break;
  }
}
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
