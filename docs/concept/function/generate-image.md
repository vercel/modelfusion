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
const imageBase64 = await generateImage(
  new OpenAIImageGenerationModel(/* ... */),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

#### With Stability AI model

```ts
const imageBase64 = await generateImage(
  new StabilityImageGenerationModel(/* ... */),
  [
    { text: "the wicked witch of the west" },
    { text: "style of early 19th century painting", weight: 0.5 },
  ]
);
```

### generateImageAsFunction

[generateImageAsFunction API](/api/modules#generateimageasfunction)

Uses a prompt template to create a function that generates an image.
The prompt template is a function that takes an input and returns a prompt that matches the model's prompt format.
The input signature of the prompt templates becomes the call signature of the generated function.

#### With Stability AI model

```ts
const generatePainting = generateImageAsFunction(
  new StabilityImageGenerationModel(/* ... */),
  async (description: string) => [
    { text: description },
    { text: "style of early 19th century painting", weight: 0.5 },
  ]
);

const imageBase64 = await generatePainting("the wicked witch of the west");
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Stability AI](/integration/model-provider/stability)
- [Automatic1111 (local)](/integration/model-provider/automatic1111)
