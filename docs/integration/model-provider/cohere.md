---
sidebar_position: 3
title: Cohere
---

# Cohere Model Provider

## Setup

You can get an API from [Cohere](https://cohere.com/).

## Usage

[Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/cohere)

The API can be configured as an environment variable (`COHERE_API_KEY`) or passed in as an option.

### Text Generation

[Cohere Text Generation API](/api/classes/CohereTextGenerationModel)

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

[Cohere Text Embedding API](/api/classes/CohereTextEmbeddingModel)

```ts
import { CohereTextEmbeddingModel } from "ai-utils.js";

const embeddingModel = new CohereTextEmbeddingModel({
  model: "embed-english-light-v2.0",
});

const embeddings = await model.embedTexts([
  "At first, Nox didn't know what to do with the pup.",
  "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
]);
```

### Tokenization

[Cohere Tokenization API](/api/classes/CohereTokenizer)

```ts
import { CohereTokenizer } from "ai-utils.js";

const tokenizer = new CohereTokenizer({ model: "command-nightly" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await tokenizer.countTokens(text);
const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```
