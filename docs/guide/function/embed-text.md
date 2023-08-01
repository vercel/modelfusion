---
sidebar_position: 15
---

# Embed Text

## Usage

### embedText

[embedText API](/api/modules#embedtext)

Generate an embedding for a single text.

#### With OpenAI embedding model

```ts
const { embedding } = await embedText(
  new OpenAITextEmbeddingModel(/* ... */),
  "At first, Nox didn't know what to do with the pup."
);
```

### embedTexts

[embedTexts API](/api/modules#embedtexts)

Generate embeddings for multiple texts.

#### With OpenAI embedding model

```ts
const { embeddings } = await embedTexts(
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
- [Llama.cpp](/integration/model-provider/llamacpp)
- [Cohere](/integration/model-provider/cohere)
