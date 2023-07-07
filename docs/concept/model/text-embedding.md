---
sidebar_position: 15
---

# Text Embedding

## Usage

[TextEmbeddingModel API](/api/interfaces/TextEmbeddingModel)

### embedText

Generate an embedding for a single text.

#### With OpenAI embedding model

```ts
const embedding = await embedText(
  new OpenAITextEmbeddingModel(/* ... */),
  "At first, Nox didn't know what to do with the pup."
);
```

### embedTexts

Generate embeddings for multiple texts.

#### With OpenAI embedding model

```ts
const embeddings = await embedTexts(
  new OpenAITextEmbeddingModel({
    /* ... */
  }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]
);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Cohere](/integration/model-provider/cohere)
