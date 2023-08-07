---
sidebar_position: 20
---

# Text Chunks & Vector Indices

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/text-chunk/)

Using vector indices to store and retrieve text chunks is a common pattern when working with language models.
One important use case is [retrieval augmented generation](/tutorial/recipes/retrieval-augmented-generation).

## TextChunk

[TextChunk API](/api/modules#textchunk)

A text chunk is a simple object with a text property:

```ts
type TextChunk = {
  text: string;
};
```

It is intended to also contain other properties depending on your use case.
The ModelFusion APIs are designed to handle such objects generically.

## VectorIndex

[VectorIndex API](/api/interfaces/VectorIndex) | [Available Vector Indices](/integration/vector-index/)

ModelFusion provides a [VectorIndex](/api/interfaces/VectorIndex) interface that can be implemented by different vector databases. This allows you to use the same code to query different vector databases, e.g. [Pinecone](/integration/vector-index/pinecone) or an [in-memory vector store](/integration/vector-index/memory). It is parameterized with a subtype of `TextChunk`.
