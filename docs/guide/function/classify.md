---
sidebar_position: 75
---

# Classify Value

Classifies a value into a category.

## Usage

[classify API](/api/modules#classify)

You can call the `classify` function with a classifier model and a value to classify.

#### Example

```ts
import { classify } from "modelfusion";

// strongly typed result:
const result = await classify({
  model: classifier, // see classifiers below
  value: "don't you love politics?",
  // ... other function options
});

switch (result) {
  case "politics":
    console.log("politics");
    break;
  case "chitchat":
    console.log("chitchat");
    break;
  case null:
    console.log("null");
    break;
}
```

## Classifiers

### EmbeddingSimilarityClassifier

[EmbeddingSimilarityClassifier API](/api/classes/EmbeddingSimilarityClassifier)

Classifies values based on their distance to the values from a set of clusters.
When the distance is below a certain threshold, the value is classified as belonging to the cluster,
and the cluster name is returned. Otherwise, the value is classified as null.

#### Example

```ts
import { EmbeddingSimilarityClassifier, openai } from "modelfusion";

const classifier = new EmbeddingSimilarityClassifier({
  // you can use any supported embedding model:
  embeddingModel: openai.TextEmbedder({
    model: "text-embedding-ada-002",
  }),

  // the threshold for the distance between the value and the cluster values:
  similarityThreshold: 0.82,

  clusters: [
    {
      name: "politics" as const,
      values: [
        "isn't politics the best thing ever",
        "why don't you tell me about your political opinions",
        "don't you just love the president",
        "don't you just hate the president",
        "they're going to destroy this country!",
        "they will save the country!",
      ],
    },
    {
      name: "chitchat" as const,
      values: [
        "how's the weather today?",
        "how are things going?",
        "lovely weather today",
        "the weather is horrendous",
        "let's go to the chippy",
      ],
    },
  ],
});
```
