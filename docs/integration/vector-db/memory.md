---
sidebar_position: 1
title: Memory
---

# Memory Vector DB

[API documentation](/api/classes/MemoryStore)
|
[Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/vector-db/MemoryStoreExample.ts)

The memory vector store is a simple implementation of the [VectorStore](/api/interfaces/VectorStore) interface that stores all vectors in memory. It is helpful for development and prototyping or when you only have a small number of entries and want to avoid setting up a database, e.g., for conversational memory that does not need to be persisted.

## Example Usage

```ts
// Create an empty store and use it:
const vectorDB = new VectorDB({
  store: new MemoryStore(),
  embeddingModel: new OpenAITextEmbeddingModel({
    // ...
  }),
});

// Adding vectors to the DB adds them to the store:
await vectorDB.upsertMany({
  keyTexts: [
    "A rainbow is an optical phenomenon that...",
    // ...
  ],
  data: texts.map((text) => ({ text })),
});

// Query the vector DB:
const results = await vectorDB.queryByText({
  queryText: "rainbow and water droplets",
  maxResults: 3,
  similarityThreshold: 0.8,
});

// The content can be serialized as JSON:
const serializedData = vectorDB.store.serialize();

// The deserialization needs a Zod schema for type validation:
const deserializedStore = await MemoryStore.deserialize({
  serializedData,
  schema: z.object({ text: z.string() }),
});
```
