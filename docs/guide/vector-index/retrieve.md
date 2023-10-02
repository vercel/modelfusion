---
sidebar_position: 20
title: Retrieve
---

# Retrieve Objects

[retrieve API](/api/modules/#retrieve)

The `retrieve` function uses a retriever and a query to retrieve a list of text chunks.
The retriever determines the type of the query.

### VectorIndexRetriever

Currently only the [VectorIndexRetriever](/api/classes/VectorIndexRetriever) is available.
It uses a vector index and an embedding model to retrieve text chunks that are similar to the query.

You can specifiy the similarity threshold, the maximum number of results, and a vector-index specific filter that is passed to the vector index.

#### Example (basic text)

You can store and retrieve basic text from vector indices. Here is an example:

```ts
const texts = [
  "A rainbow is an optical phenomenon that...",
  // ...
];

const vectorIndex = new MemoryVectorIndex<string>();

// ...

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

// retrievedObjects contains the 3 objects with embedded values
// most similar to "rainbow and water droplets"
```

#### Example (structures & filtering)

```ts
const texts = [
  {
    content: "A rainbow is an optical phenomenon...",
    page: 1,
  },
  // ...
  ,
];

const vectorIndex = new MemoryVectorIndex<{
  content: string;
  page: number;
}>();

// ...

const retrievedObjects = await retrieve(
  new VectorIndexRetriever({
    vectorIndex,
    embeddingModel: new OpenAITextEmbeddingModel({
      model: "text-embedding-ada-002",
    }),
    maxResults: 2,
    similarityThreshold: 0.7,
    filter: (object) => object.page === 3,
  }),
  "rainbow and water droplets"
);

// retrievedObjects contains the 2 objects with a page property of 3
// that have embedded values most similar to "rainbow and water droplets"
```
