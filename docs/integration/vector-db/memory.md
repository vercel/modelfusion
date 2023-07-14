---
sidebar_position: 1
title: Memory
---

# Memory Vector DB

The memory vector index is a simple implementation of the [VectorIndex](/api/interfaces/VectorIndex) interface that stores all vectors in memory. It is helpful for development and prototyping or when you only have a small number of entries and want to avoid setting up a database, e.g., for conversational memory that does not need to be persisted.

## Usage

[API](/api/classes/MemoryVectorIndex)
|
[Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/vector-db/MemoryVectorIndexExample.ts)

### Create a Vector DB

```ts
import { MemoryVectorIndex, VectorDB } from "ai-utils.js";

const vectorDB = new VectorDB({
  index: new MemoryVectorIndex(),
  embeddingModel: // ...
});
```

### Serialization

```ts
const serializedData = vectorDB.index.serialize();
```

### Deserialization

Deserialization needs a Zod schema for type validation:

```ts
const deserializedIndex = await MemoryVectorIndex.deserialize({
  serializedData,
  schema: z.object({ text: z.string() }),
});
```
