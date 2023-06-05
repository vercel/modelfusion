---
sidebar_position: 3
title: Cohere
---

# Cohere Model Provider

[Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/cohere)

## Example

```ts
const embeddingModel = new CohereTextEmbeddingModel({
  apiKey: COHERE_API_KEY,
  model: "embed-english-light-v2.0",
});

const response = await embeddingModel.embed([
  "At first, Nox didn't know what to do with the pup.",
  "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
]);

const embeddings = await embeddingModel.extractEmbeddings(response);
```

## Models

- [Text Generation Model](/api/classes/CohereTextGenerationModel)
- [Text Embedding Model](/api/classes/CohereTextEmbeddingModel)
- [Tokenization](/api/classes/CohereTokenizer)

## API Clients

- [Text Generation](/api/modules/#callcoheretextgenerationapi)
- [Embedding](/api/modules/#callcohereembeddingapi)
- [Tokenize](/api/modules/#callcoheretokenizeapi)
- [Detokenize](/api/modules/#callcoheredetokenizeapi)
