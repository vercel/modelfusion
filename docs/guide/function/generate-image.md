---
sidebar_position: 20
---

# Generate Image

Generates an image using a prompt. The prompt template depends on the model.
For example, OpenAI image models expect a string prompt, and Stability AI models expect an array of text prompts with optional weights.

By default, the image is a binary buffer. You can use set the `fullResponse` option to `true` and use the `imageBase64` property from the result to get a base-64 encoded string instead.

## Usage

### ImageGenerationModel

The different [ImageGenerationModel](/api/interfaces/ImageGenerationModel) implementations (see [available providers](#available-providers)) share common settings:

- **numberOfGenerations**: The number of images to generate.

In addition to these common settings, each model exposes its own settings.
The settings can be set in the constructor of the model, or in the `withSettings` method.

### generateImage

[generateImage API](/api/modules#generateimage)

#### OpenAI DALL·E image buffer

```ts
import { generateImage, openai } from "modelfusion";

const imageBuffer = await generateImage({
  model: openai.ImageGenerator(/* ... */),
  prompt:
    "the wicked witch of the west in the style of early 19th century painting",
});
```

#### Stability AI image buffer

```ts
import { generateImage, stability } from "modelfusion";

const imageBuffer = await generateImage({
  model: stability.ImageGenerator(/* ... */),
  prompt: [
    { text: "the wicked witch of the west" },
    { text: "style of early 19th century painting", weight: 0.5 },
  ],
});
```

#### OpenAI DALL·E base64 image

You can use the `fullResponse` setting to get a base-64 encoded string instead of a binary buffer.

```ts
import { generateImage, openai } from "modelfusion";

const { imageBase64 } = await generateImage({
  model: openai.ImageGenerator(/* ... */),
  prompt:
    "the wicked witch of the west in the style of early 19th century painting",
  fullResponse: true,
});
```

#### Stability AI multiple image buffers

You can use the `numberOfGenerations` setting to generate multiple images. The result will be an array of image buffers in the `images` respose property that is available when you set the `fullResponse` setting to `true`.

```ts
import { generateImage, stability } from "modelfusion";

const { images } = await generateImage({
  model: stability.ImageGenerator({
    numberOfGenerations: 2,
    // ...
  }),
  prompt: [
    { text: "the wicked witch of the west" },
    { text: "style of early 19th century painting", weight: 0.5 },
  ],
  fullResponse: true,
});
```

## Prompt Template

[Prompt templates](/api/interfaces/PromptTemplate) change the prompt template that an image generation model accepts.
This enables the use of abstracted prompts, e.g. basic prompts that are just text.

You can map the prompt of an [ImageGenerationModel](/api/interfaces/ImageGenerationModel) using the `withPromptTemplate()` method.
For convenience, models with clear prompt templates have a `withTextPrompt()` method that returns a model with a simple text prompt.

### Basic Prompts

Basic prompts are simple text prompts.

#### Example

```ts
const model = stability
  .ImageGenerator({
    // ...
  })
  .withTextPrompt();
```

You can now generate images using a text prompt:

```ts
const image = await generateImage({
  model,
  prompt:
    "the wicked witch of the west in the style of early 19th century painting",
});
```

#### Prompt Templates

The following prompt templates are available for basic text prompts:

- **Automatic1111**: [mapBasicPromptToAutomatic1111Format()](/api/modules#mapbasicprompttoautomatic1111format)
- **Stability AI**: [mapBasicPromptToStabilityFormat()](/api/modules#mapbasicprompttostabilityformat)

### Custom Prompt Templates

You can also create your own custom prompt templates and prompt templates.

For this, you need to:

1. create an interface/type for your prompt template, and
2. create prompt templates that map your prompt template to the prompt templates of the models that you want to use.

The interface for [prompt template](/api/interfaces/PromptTemplate) consists of a map function
and a list of stop tokens.

```ts
interface PromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> {
  map(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;
}
```

When you have a prompt template that matches the prompt template of a model, you can apply it as follows:

```ts
const modelWithMyCustomPromptTemplate =
  model.withPromptTemplate(myPromptTemplate);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Stability AI](/integration/model-provider/stability)
- [Automatic1111 (local)](/integration/model-provider/automatic1111)
