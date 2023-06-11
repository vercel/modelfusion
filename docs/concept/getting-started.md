---
sidebar_position: 1
---

# Getting Started

**⚠️ `ai-utils.js` is currently in its initial experimental phase. Until version 0.1 there may be breaking changes in each release.**

## Installation

```bash
npm install ai-utils.js
```

## Requirements

- [Node.js](https://nodejs.org/en/download/) version 18 or above (for 'fetch' support)

## Usage Examples

### Image Generation

```ts
import { OpenAIImageGenerationModel } from "ai-utils.js";

const model = new OpenAIImageGenerationModel({
  size: "512x512",
});

const imageBase64 = await model.generateImage(
  "the wicked witch of the west in the style of early 19th century painting"
);
```

### Text Embedding

```ts
import { OpenAITextEmbeddingModel } from "ai-utils.js";

const model = new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
});

const embeddings = await model.embedTexts([
  "At first, Nox didn't know what to do with the pup.",
  "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
]);
```

### Vector DB

```ts
import { MemoryStore, OpenAITextEmbeddingModel, VectorDB } from "ai-utils.js";

const texts = [
  "A rainbow is an optical phenomenon that can occur under certain meteorological conditions.",
  "It is caused by refraction, internal reflection and dispersion of light in water droplets resulting in a continuous spectrum of light appearing in the sky.",
  // ...
];

const vectorDB = new VectorDB({
  store: new MemoryStore(),
  embeddingModel: new OpenAITextEmbeddingModel({
    model: "text-embedding-ada-002",
  }),
});

await vectorDB.upsertMany({
  keyTexts: texts,
  data: texts.map((text) => ({ text })),
});

const results = await vectorDB.queryByText({
  queryText: "rainbow and water droplets",
  maxResults: 3,
  similarityThreshold: 0.8,
});
```

### Tokenization

```ts
import { TikTokenTokenizer } from "ai-utils.js";

const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await tokenizer.countTokens(text);
const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```
