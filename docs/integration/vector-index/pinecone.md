---
sidebar_position: 2
title: Pinecone
---

# Pinecone Vector Index

## Setup

You can get an API key from [Pinecone](https://www.pinecone.io/). You also need to create a Pinecone index.

### Pinecone Client

You need to install the Pinecone JS client separately:

```bash
npm install @pinecone-database/pinecone
```

## Usage

[API](/api/classes/PineconeVectorIndex)
|
[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/vector-index/)

### Create a Vector Index

```ts
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeVectorIndex } from "modelfusion";

// Initialize the Pinecone index:
const client = new PineconeClient();
await client.init({
  apiKey: PINECONE_API_KEY,
  environment: PINECONE_ENVIRONMENT,
});
const index = client.Index(PINECONE_INDEX_NAME);

// assuming zod schema for data and an embedding model are defined:
const vectorIndex = new PineconeVectorIndex({
  index,
  schema: zodSchema,
});
```
