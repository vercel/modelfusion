---
sidebar_position: 20
title: Retrieve
---

# Retrieve Objects

[retrieve API](/api/modules/#retrieve)

The `retrieve` function uses a retriever and a query to retrieve a list of text chunks.
The retriever determines the type of the query.

Currently only the [VectorIndexRetriever](/api/classes/VectorIndexRetriever) is available.
It uses a vector index and an embedding model to retrieve text chunks that are similar to the query.

#### Example

```ts
const retrievedObjects = await retrieve(
  new VectorIndexRetriever({
    vectorIndex,
    embeddingModel: new OpenAITextEmbeddingModel({
      model: "text-embedding-ada-002",
    }),
    maxResults: 3,
    similarityThreshold: 0.8,
  }),
  "rainbow and water droplets"
);

// retrievedObjects contains the 3 objects with embedded values most similar texts to "rainbow and water droplets"
```
