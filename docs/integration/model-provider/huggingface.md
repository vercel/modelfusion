---
sidebar_position: 20
title: Hugging Face
---

# Hugging Face

## Setup

1. You can get an API key from [Hugging Face](https://huggingface.co/).
1. The API key can be configured as an environment variable (`HUGGINGFACE_API_KEY`) or passed in as an option into the model constructor.

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/huggingface)

If the model is not loaded on Hugging Face, ModelFusion will wait by default.
This can take a minute and longer for the first call.
You can override this behavior by setting `waitForModel` to `false` in the model settings.

### Generate Text

[HuggingFaceTextGenerationModel API](/api/classes/HuggingFaceTextGenerationModel)

```ts
import { huggingface, generateText } from "modelfusion";

const text = await generateText({
  model: huggingface.TextGenerator({
    model: "tiiuae/falcon-7b",
    temperature: 700,
    maxNewTokens: 500,
  }),
  prompt: "Write a short story about a robot learning to love:\n\n",
});
```

### Embed Text

[HuggingFaceTextEmbeddingModel API](/api/classes/HuggingFaceTextEmbeddingModel)

Text embeddings are using the HuggingFace feature extract pipeline.

```ts
import { huggingface, embedMany } from "modelfusion";

const embeddings = await embedMany({
  model: huggingface.TextEmbedder({
    model: "intfloat/e5-base-v2",
    dimensions: 768,
  }),
  values: [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ],
});
```

## Configuration

### API Configuration

[Hugging Face API Configuration](/api/classes/HuggingFaceApiConfiguration)

```ts
const api = huggingface.Api({
  apiKey: "my-api-key",
  // ...
});

const model = huggingface.TextGenerator({
  api,
  // ...
});
```
