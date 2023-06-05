---
sidebar_position: 20
---

# Vector DBs

Vector databases power AI applications through similarity search. They are a key component of many AI applications, including recommender systems, search engines, and chatbots. You can store embeddings in a vector database and then query it to find the most similar embeddings to a given query embedding.

## Usage

In `ai-utils.js`, a vector database is represented by the [VectorDB](/api/classes/VectorDB) class. It combines a [VectorStore](/api/interfaces/VectorStore) with a [TextEmbeddingModel](/api/interfaces/TextEmbeddingModel).

### Creating a vector DB

```ts
const vectorDB = new VectorDB({
  store: new InMemoryStore(),
  embeddingModel: new OpenAITextEmbeddingModel({
    apiKey: OPENAI_API_KEY,
    model: "text-embedding-ada-002",
  }),
});
```

### Inserting and updating vector entries

```ts
const texts = [
  "A rainbow is an optical phenomenon...", // ...
];

await vectorDB.upsertMany({
  // keyTexts are embedded to become vectors:
  keyTexts: texts,
  // data is stored alongside the vectors:
  data: texts.map((text) => ({ text })),
});
```

### Similarity search with text

The `queryByText` method takes a query text and returns the most similar entries in the vector database (using the vector keys).

```ts
const results = await vectorDB.queryByText({
  queryText: "rainbow and water droplets",
  maxResults: 3,
  similarityThreshold: 0.8,
});
```

## Available Vector DBs

- [In-Memory](/integration/vector-db/in-memory)
- [Pinecone](/integration/vector-db/pinecone)
