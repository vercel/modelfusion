---
sidebar_position: 1
---

# Vector Indices

Vector databases power AI applications through similarity search. They are a key component of many AI applications, including recommender systems, search engines, and chatbots. You can store embeddings in a vector database and then query it to find the most similar embeddings to a given query embedding.

ModelFusion provides a [VectorIndex](/api/interfaces/VectorIndex) interface that can be implemented by different vector databases. This allows you to use the same code to query different vector databases, e.g. [Pinecone](/integration/vector-index/pinecone) or an [in-memory vector store](/integration/vector-index/memory). [Learn more...](/guide/text-chunk/)

## Available Vector Indices

- [Memory](/integration/vector-index/memory)
- [Pinecone](/integration/vector-index/pinecone)
