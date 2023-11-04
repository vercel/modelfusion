---
sidebar_position: 70
---

# Embed Value

Embeddings convert data, like text, into compact vector representations, capturing their essence in a way that's useful for AI tasks.

## Usage

### embed

[embed API](/api/modules#embed)

Generate an embedding for a single value.

#### With OpenAI text embeddings

```ts
const embedding = await embed(
  new OpenAITextEmbeddingModel(/* ... */),
  "At first, Nox didn't know what to do with the pup."
);
```

### embedMany

[embedMany API](/api/modules#embedmany)

Generate embeddings for multiple values.

#### With OpenAI text embeddings

```ts
const embeddings = await embedMany(
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
- [Llama.cpp](/integration/model-provider/llamacpp)
- [Ollama](/integration/model-provider/ollama)
- [HuggingFace](/integration/model-provider/huggingface)
