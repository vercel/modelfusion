---
sidebar_position: 1
title: Memory
---

# Memory Vector Index

The memory vector index is a simple implementation of the [VectorIndex](/api/interfaces/VectorIndex) interface that stores all vectors in memory. It is helpful for development and prototyping or when you only have a small number of entries and want to avoid setting up a database, e.g., for conversational memory that does not need to be persisted.

## Usage

[API](/api/classes/MemoryVectorIndex)
|
[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/text-chunk/)

### Create a Vector Index

```ts
import { MemoryVectorIndex } from "modelfusion";

const vectorIndex = new MemoryVectorIndex<TextChunk>();
```

### Serialization

```ts
const serializedData = vectorIndex.serialize();
```

### Deserialization

Deserialization can optionally take a Zod schema for type validation:

```ts
const deserializedIndex = await MemoryVectorIndex.deserialize({
  serializedData,
  schema: z.object({ text: z.string() }),
});
```
