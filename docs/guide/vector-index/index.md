---
sidebar_position: 18
---

# Vector Indices

[VectorIndex API](/api/interfaces/VectorIndex) | [Available Vector Indices](/integration/vector-index/) | [Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/vector-index/)

Using vector indices to store and retrieve objects is a common pattern when working with language models.
One important use case is [retrieval augmented generation](/tutorial/recipes/retrieval-augmented-generation).

ModelFusion provides a [VectorIndex](/api/interfaces/VectorIndex) interface that can be implemented by different vector databases. This allows you to use the same code to query different vector databases, e.g. [Pinecone](/integration/vector-index/pinecone) or an [in-memory vector store](/integration/vector-index/memory). It is parameterized with a subtype of `TextChunk`.
