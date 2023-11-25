---
sidebar_position: 10
title: Upsert
---

# Upsert Objects

[upsertIntoVectorIndex API](/api/modules/#upsertintovectorindex)

With `upsertIntoVectorIndex`, you can insert and update objects in a vector index.
It uses a vector index, an embedding model, and a funtion to determine the value to embed for each object.

### Example

```ts
const texts = [
  "A rainbow is an optical phenomenon that can occur under certain meteorological conditions.",
  "It is caused by refraction, internal reflection and dispersion of light in water droplets resulting in a continuous spectrum of light appearing in the sky.",
  // ...
];

const vectorIndex = new MemoryVectorIndex<string>();

await upsertIntoVectorIndex({
  vectorIndex,
  embeddingModel: openai.TextEmbedder({
    model: "text-embedding-ada-002",
  }),
  objects: texts,
  getValueToEmbed: (text) => text,
});

// vectorIndex now contains the embeddings of the texts and the texts themselves
```
