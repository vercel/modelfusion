---
sidebar_position: 2
---

# Embed Text

The `embedText` and `embedTexts` functions creates embedding [vectors](/api/modules#vector) for texts using [text embedding models](/api/interfaces/TextEmbeddingModel). These functions can be called directly or used via `.asFunction`. It has the following main arguments:

- `model`: Specify the machine learning model that `embedText` should use for generating the embedding.

One of the main use cases of text embeddings is similarity search. For this use case, it can be easier to use the [Vector DB](/concept/vector-db) integration, which provides a higher-level API for similarity search.

### Example Usage

```ts
// create text embedding model:
const model = new OpenAITextEmbeddingModel({
  apiKey: OPENAI_API_KEY,
  model: "text-embedding-ada-002",
});

// embed texts:
const embeddings = await embedTexts({
  model,
  texts: [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him.",
  ],
});
```

### API

- [embedText](/api/modules/#embedtext)
- [embedText.asFunction](/api/namespaces/embedText#asfunction)
- [embedTexts](/api/modules/#embedtexts)
- [embedTexts.asFunction](/api/namespaces/embedTexts#asfunction)
