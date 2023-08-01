---
sidebar_position: 40
---

# Generate Image

## Usage

### generateImage

[generateImage API](/api/modules#generateimage)

Generates a base64-encoded image using a prompt.
The prompt format depends on the model.
For example, OpenAI image models expect a string prompt, and Stability AI models expect an array of text prompts with optional weights.

#### With OpenAI image model

```ts
const { image } = await generateImage(
  new OpenAIImageGenerationModel(/* ... */),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

#### With Stability AI model

```ts
const { image } = await generateImage(
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
