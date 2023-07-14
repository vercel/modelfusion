---
sidebar_position: 2
title: Pinecone
---

# Pinecone Vector DB

## Setup

You can get an API key from [Pinecone](https://www.pinecone.io/). You also need to create an index.

### Pinecone Client

You need to install the Pinecone JS client separately:

```bash
npm install @pinecone-database/pinecone
```

## Usage

[API](/api/classes/PineconeVectorIndex)
|
[Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/vector-db/PineconeVectorIndexExample.ts)

### Create a Vector DB

```ts
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeVectorIndex, VectorDB } from "ai-utils.js";

// Initialize the Pinecone index:
const client = new PineconeClient();
await client.init({
  apiKey: PINECONE_API_KEY,
  environment: PINECONE_ENVIRONMENT,
});
const index = client.Index(PINECONE_INDEX_NAME);

// assuming zod schema for data and an embedding model are defined:
const vectorDB = new VectorDB({
  index: new PineconeVectorIndex({ index, schema: zodSchema }),
  embeddingModel: // ...
});
```
