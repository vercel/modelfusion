---
sidebar_position: 20
---

# Store Text Chunks

You can store text chunks by upserting them into a vector index.

### Upserting text chunks

[upsertTextChunks API](/api/modules/#upserttextchunks)

With `upsertTextChunks`, you can insert and update text chunks in a vector index.
It uses a vector index and an embedding model.

#### Example

```ts
const texts = [
  "A rainbow is an optical phenomenon that can occur under certain meteorological conditions.",
  "It is caused by refraction, internal reflection and dispersion of light in water droplets resulting in a continuous spectrum of light appearing in the sky.",
  // ...
];

const chunks = texts.map((text) => ({ text }))

await upsertTextChunks({
  vectorIndex,
  embeddingModel: new OpenAITextEmbeddingModel({
    model: "text-embedding-ada-002",
  }),
  chunks,
  ids: ... // array optional ids for updating chunks (vs. inserting)
});
```
