---
sidebar_position: 32
---

# Describe Image

## Usage

### describeImage

[describeImage API](/api/modules#describeimage)

Describe an image as text. Depending on the model, this can be used for image captioning, for describing the contents of an image, or for OCR.

#### Example: HuggingFace image captioning model

```ts
const imageResponse = await fetch(imageUrl);
const data = Buffer.from(await imageResponse.arrayBuffer());

const text = await describeImage(
  new HuggingFaceImageDescriptionModel({
    model: "nlpconnect/vit-gpt2-image-captioning",
  }),
  data
);
```

## Available Providers

- [HuggingFace](/integration/model-provider/huggingface)
