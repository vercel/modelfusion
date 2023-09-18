---
sidebar_position: 50
---

# Retrieve Text Chunks

### Retrieving text chunks

[retrieveObjects API](/api/modules/#retrieveObjects)

The `retrieveObjects` function uses a retriever and a query to retrieve a list of text chunks.
The retriever determines the type of the query.

Currently only the [SimilarTextChunksFromVectorIndexRetriever](/api/classes/SimilarTextChunksFromVectorIndexRetriever) is available.
It uses a vector index and an embedding model to retrieve text chunks that are similar to the query.

#### Example

```ts
const { chunks } = await retrieveObjects(
  new SimilarTextChunksFromVectorIndexRetriever({
    vectorIndex,
    embeddingModel: new OpenAITextEmbeddingModel({
      model: "text-embedding-ada-002",
    }),
    maxResults: 3,
    similarityThreshold: 0.8,
  }),
  "rainbow and water droplets"
);
```
