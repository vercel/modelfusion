---
sidebar_position: 2
---

# Pinecone Store

[API documentation](/api/classes/PineconeStore)
|
[Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/vector-db/PineconeStoreExample.ts)

### Example

```ts
import { PineconeClient } from "@pinecone-database/pinecone";

// ...

const client = new PineconeClient();
await client.init({
  apiKey: PINECONE_API_KEY,
  environment: PINECONE_ENVIRONMENT,
});
const index = client.Index(PINECONE_INDEX_NAME);

// assuming zod schema for data and an embedding model are defined:
const vectorDB = new VectorDB({
  store: new PineconeStore({ index, schema: zodSchema }),
  embeddingModel,
});
```
