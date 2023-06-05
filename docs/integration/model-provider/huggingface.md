---
sidebar_position: 4
title: Hugging Face
---

# Hugging Face Model Provider

[Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/huggingface)

## Example

```ts
const textGenerationModel = new HuggingFaceTextGenerationModel({
  apiKey: HUGGINGFACE_API_KEY,
  model: "tiiuae/falcon-7b",
  settings: { temperature: 700 },
});

const response = await textGenerationModel
  .withSettings({ maxNewTokens: 500 })
  .generate("Write a short story about a robot learning to love:\n\n");

const text = await textGenerationModel.extractText(response);
```

## Models

- [Text Generation Model](/api/classes/HuggingFaceTextGenerationModel)

## API Clients

- [Text Generation](/api/modules/#callhuggingfacetextgenerationapi)
