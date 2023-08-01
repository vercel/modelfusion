---
sidebar_position: 5
---

# Generate JSON

Generates JSON that matches a schema.
This is, for example, useful for [information extraction](/tutorial/recipes/information-extraction)
and classification tasks (e.g. [sentiment analysis](/tutorial/recipes/sentiment-analysis)).

## Usage

### generateJson

[generateJson API](/api/modules#generatejson)

#### OpenAI chat model

```ts
const { value: sentiment } = await generateJson(
  new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0,
    maxTokens: 50,
  }),
  {
    name: "sentiment" as const,
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

## Available Providers

- [OpenAI](/integration/model-provider/openai)
