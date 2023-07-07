---
sidebar_position: 2
---

# Sentiment Analysis

### With OpenAI Chat Model and JSON Generation

[Example](https://github.com/lgrammel/ai-utils.js/blob/main/examples/basic/src/recipes/sentiment-analysis.ts)

```ts
const model = new OpenAIChatModel({
  model: "gpt-4",
  temperature: 0, // remove randomness as much as possible
  maxTokens: 500, // enough tokens for reasoning and sentiment
});

const analyzeSentiment = model.generateJsonAsFunction(
  async (productReview: string) => [
    OpenAIChatMessage.system(
      "You are a sentiment evaluator. Analyze the sentiment of the following product review:"
    ),
    OpenAIChatMessage.user(productReview),
  ],
  {
    name: "sentiment",
    description: "Write the sentiment analysis",
    parameters: z.object({
      // Reason first to improve results:
      reasoning: z.string().describe("Reasoning to explain the sentiment."),
      // Report sentiment after reasoning:
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    }),
  }
);

// negative sentiment example:
const { sentiment } = await analyzeSentiment(
  "After I opened the package, I was met by a very unpleasant smell " +
    "that did not disappear even after washing. The towel also stained " +
    "extremely well and also turned the seal of my washing machine red. " +
    "Never again!"
);
```

You can also get the full reasoning and the sentiment:

```ts
const result1 = await analyzeSentiment(
  "After I opened the package, I was met by a very unpleasant smell " +
    "that did not disappear even after washing. The towel also stained " +
    "extremely well and also turned the seal of my washing machine red. " +
    "Never again!"
);

console.log(JSON.stringify(result1, null, 2));
// {
//   "reasoning": "The reviewer is expressing dissatisfaction with the product.
//      They mention an unpleasant smell, staining, and damage to their washing machine,
//      all of which are negative experiences.",
//   "sentiment": "negative"
// }
```
