---
sidebar_position: 4
---

# Hugging Face

[API documentation](/api/modules/model_huggingface)
|
[Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model/huggingface)

## Import

```ts
import { HuggingFaceTextGenerationModel, ... } from "ai-utils.js/model/huggingface";
```

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

const text = await textGenerationModel.extractOutput(response);
```

## Models

- [Text Generation Model](/api/classes/model_huggingface.HuggingFaceTextGenerationModel)

## API Clients

- [Text Generation](/api/modules/model_huggingface#generatehuggingfacetextcompletion)
