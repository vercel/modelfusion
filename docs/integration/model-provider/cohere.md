---
sidebar_position: 3
title: Cohere
---

# Cohere Model Provider

[Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/cohere)

## Usage

### Text Generation

[Text Generation Model API](/api/classes/CohereTextGenerationModel)

```ts
import { CohereTextGenerationModel } from "ai-utils.js";

const textGenerationModel = new CohereTextGenerationModel({
  model: "command-nightly",
  temperature: 0.7,
  maxTokens: 500,
});

const text = await textGenerationModel.generateText(
  "Write a short story about a robot learning to love:\n\n"
);
```

### Text Embedding

[Text Embedding Model API](/api/classes/CohereTextEmbeddingModel)

```ts
const embeddingModel = new CohereTextEmbeddingModel({
  apiKey: COHERE_API_KEY,
  model: "embed-english-light-v2.0",
});

const response = await embeddingModel.embed([
  "At first, Nox didn't know what to do with the pup.",
  "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
]);

const embeddings = await embeddingModel.extractEmbeddings(response);
```

### Tokenization

[Tokenization API](/api/classes/CohereTokenizer)
