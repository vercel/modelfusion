---
sidebar_position: 1
---

# Vector DBs

Vector databases power AI applications through similarity search. They are a key component of many AI applications, including recommender systems, search engines, and chatbots. You can store embeddings in a vector database and then query it to find the most similar embeddings to a given query embedding.

## Usage

[API](/api/classes/VectorDB)
|
[Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/vector-db/)

### Create a Vector DB

```ts
import { VectorDB } from "ai-utils.js";

const vectorDB = new VectorDB({
  store: // a vector store
  embeddingModel: // an embedding model
});
```

### Adding vectors

```ts
await vectorDB.upsertMany({
  keyTexts: [
    "A rainbow is an optical phenomenon that...",
    // ...
  ],
  data: texts.map((text) => ({ text })),
});
```

### Querying vectors

```ts
const results = await vectorDB.queryByText({
  queryText: "rainbow and water droplets",
  maxResults: 3,
  similarityThreshold: 0.8,
});
```
