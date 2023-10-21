---
sidebar_position: 5
title: Hugging Face
---

# Hugging Face

## Setup

1. You can get an API key from [Hugging Face](https://huggingface.co/).
1. The API key can be configured as an environment variable (`HUGGINGFACE_API_KEY`) or passed in as an option into the model constructor.

## Configuration

### API Configuration

[Hugging Face API Configuration](/api/classes/HuggingFaceApiConfiguration)

```ts
const api = new HuggingFaceApiConfiguration({
  // ...
});

const model = new HuggingFaceTextGenerationModel({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/huggingface)

If the model is not loaded on Hugging Face, ModelFusion will wait by default.
This can take a minute and longer for the first call.
You can override this behavior by setting `waitForModel` to `false` in the model settings.

### Generate Text

[HuggingFaceTextGenerationModel API](/api/classes/HuggingFaceTextGenerationModel)

```ts
import { HuggingFaceTextGenerationModel, generateText } from "modelfusion";

const text = await generateText(
  new HuggingFaceTextGenerationModel({
    model: "tiiuae/falcon-7b",
    temperature: 700,
    maxNewTokens: 500,
  }),
  "Write a short story about a robot learning to love:\n\n"
);
```

### Generate Text (Image Description Model)

[HuggingFaceImageDescriptionModel API](/api/classes/HuggingFaceImageDescriptionModel)

```ts
import { HuggingFaceImageDescriptionModel, generateText } from "modelfusion";

const imageResponse = await fetch(imageUrl);
const data = Buffer.from(await imageResponse.arrayBuffer());

const text = await generateText(
  new HuggingFaceImageDescriptionModel({
    model: "nlpconnect/vit-gpt2-image-captioning",
  }),
  data
);
```

### Embed Text

[HuggingFaceTextEmbeddingModel API](/api/classes/HuggingFaceTextEmbeddingModel)

Text embeddings are using the HuggingFace feature extract pipeline.

```ts
import { HuggingFaceTextEmbeddingModel, embedMany } from "modelfusion";

const embeddings = await embedMany(
  new HuggingFaceTextEmbeddingModel({
    model: "intfloat/e5-base-v2",
    embeddingDimensions: 768,
  }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]
);
```
