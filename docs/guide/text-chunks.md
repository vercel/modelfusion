---
sidebar_position: 20
---

# Text Chunks & Vector Indices

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/vector-index/)

### VectorIndex

[VectorIndex API](/api/interfaces/VectorIndex)

ModelFusion provides a [VectorIndex](/api/interfaces/VectorIndex) interface that can be implemented by different vector databases. This allows you to use the same code to query different vector databases, e.g. [Pinecone](/integration/vector-index/pinecone) or an [in-memory vector store](/integration/vector-index/memory). It is parameterized with a subtype of `TextChunk`.

#### Example

```ts
const vectorIndex = new MemoryVectorIndex<TextChunk>();
```

### Upserting text chunks

[upsertTextChunks API](/api/modules/#upserttextchunks)

With `upsertTextChunks`, you can insert and update text chunks in a vector index.
It uses a vector index and an embedding model.

#### Example

```ts
await upsertTextChunks({
  vectorIndex,
  embeddingModel: new OpenAITextEmbeddingModel({
    model: "text-embedding-ada-002",
  }),
  chunks: texts.map((text) => ({ content: text })),
  ids: ... // array optional ids for updating chunks (vs. inserting)
});
```

### Retrieving text chunks

[retrieveTextChunks API](/api/modules/#retrievetextchunks)

The `retrieveTextChunks` function uses a retriever and a query to retrieve a list of text chunks.
The retriever determines the type of the query

Currently only the [VectorIndexSimilarTextChunkRetriever](/api/classes/VectorIndexSimilarTextChunkRetriever) is available.
It uses a vector index and an embedding model to retrieve text chunks that are similar to the query.

#### Example

```ts
const { chunks } = await retrieveTextChunks(
  new VectorIndexSimilarTextChunkRetriever({
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

## Demo Apps

### [PDF to Tweet](https://github.com/lgrammel/modelfusion/tree/main/examples/pdf-to-tweet)

> _terminal app_, _PDF parsing_, _recursive information extraction_, _in memory vector index, \_style example retrieval_, _OpenAI GPT-4_, _cost calculation_

Extracts information about a topic from a PDF and writes a tweet in your own style about it.

## Available Vector Indices

- [Memory](/integration/vector-index/memory)
- [Pinecone](/integration/vector-index/pinecone)
