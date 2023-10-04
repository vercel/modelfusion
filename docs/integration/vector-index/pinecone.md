---
sidebar_position: 2
title: Pinecone
---

# Pinecone Vector Index

## Setup

You can get an API key from [Pinecone](https://www.pinecone.io/). You also need to create a Pinecone index.

### Pinecone Client

You need to install the Pinecone JS client and the ModelFusion Pinecone extension:

```bash
npm install @modelfusion/pinecone @pinecone-database/pinecone
```

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/vector-index/)

### Create a Vector Index

```ts
import { PineconeVectorIndex } from "@modelfusion/pinecone";
import { PineconeClient } from "@pinecone-database/pinecone";
import { ZodSchema } from "modelfusion";

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
  schema: new ZodSchema(zodSchema),
});
```
