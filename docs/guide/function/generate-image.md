---
sidebar_position: 40
---

# Generate Image

Generates an image using a prompt. The prompt format depends on the model.
For example, OpenAI image models expect a string prompt, and Stability AI models expect an array of text prompts with optional weights.

By default, the image is encoded as a base64 string. You can use the `asBuffer()` method on the result to get a binary buffer instead.

## Usage

### generateImage

[generateImage API](/api/modules#generateimage)

#### OpenAI DALL·E base64

```ts
const imageBase64 = await generateImage(
  new OpenAIImageGenerationModel(/* ... */),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

#### OpenAI DALL·E buffer

```ts
const imageBuffer = await generateImage(
  new OpenAIImageGenerationModel(/* ... */),
  "the wicked witch of the west in the style of early 19th century painting"
).asBuffer();
```

#### Stability AI base64

```ts
const imageBase64 = await generateImage(
  new StabilityImageGenerationModel(/* ... */),
  [
    { text: "the wicked witch of the west" },
    { text: "style of early 19th century painting", weight: 0.5 },
  ]
);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Stability AI](/integration/model-provider/stability)
- [Automatic1111 (local)](/integration/model-provider/automatic1111)
