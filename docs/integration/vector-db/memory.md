---
sidebar_position: 1
title: Memory
---

# Memory Vector DB

The memory vector store is a simple implementation of the [VectorStore](/api/interfaces/VectorStore) interface that stores all vectors in memory. It is helpful for development and prototyping or when you only have a small number of entries and want to avoid setting up a database, e.g., for conversational memory that does not need to be persisted.

## Usage

[API](/api/classes/MemoryStore)
|
[Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/vector-db/MemoryStoreExample.ts)

### Create a Vector DB

```ts
import { MemoryStore, VectorDB } from "ai-utils.js";

const vectorDB = new VectorDB({
  store: new MemoryStore(),
  embeddingModel: // ...
});
```

### Serialization

```ts
const serializedData = vectorDB.store.serialize();
```

### Deserialization

Deserialization needs a Zod schema for type validation:

```ts
const deserializedStore = await MemoryStore.deserialize({
  serializedData,
  schema: z.object({ text: z.string() }),
});
```
