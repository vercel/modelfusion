---
sidebar_position: 20
---

# Generate Image

Generates an image using a prompt. The prompt format depends on the model.
For example, OpenAI image models expect a string prompt, and Stability AI models expect an array of text prompts with optional weights.

By default, the image is a binary buffer. You can use the `asBase64Text()` method on the result to get a base-64 encoded string instead.

## Usage

[generateImage API](/api/modules#generateimage)

#### OpenAI DALL·E buffer

```ts
const imageBuffer = await generateImage(
  new OpenAIImageGenerationModel(/* ... */),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

#### OpenAI DALL·E base64

```ts
const imageBase64 = await generateImage(
  new OpenAIImageGenerationModel(/* ... */),
  "the wicked witch of the west in the style of early 19th century painting"
).asBase64Text();
```

#### Stability AI buffer

```ts
const imageBuffer = await generateImage(
  new StabilityImageGenerationModel(/* ... */),
  [
    { text: "the wicked witch of the west" },
    { text: "style of early 19th century painting", weight: 0.5 },
  ]
);
```

## Prompt Format

[Prompt formats](/api/interfaces/PromptFormat) change the prompt format that an image generation model accepts.
This enables the use of abstracted prompts, e.g. basic prompts that are just text.

You can map the prompt of an [ImageGenerationModel](/api/interfaces/ImageGenerationModel) using the `withPromptFormat()` method. For convience, models with clear prompt formats have a `withBasicPrompt()` method that returns a model with a simple text prompt.

### Basic Prompts

Basic prompts are simple text prompts.

#### Example

```ts
const model = new StabilityImageGenerationModel({
  // ...
}).withBasicPrompt();
```

You can now generate images using a text prompt:

```ts
const image = await generateImage(
  model,
  "the wicked witch of the west in the style of early 19th century painting"
);
```

#### Prompt Formats

The following prompt formats are available for basic text prompts:

- **Automatic1111**: [mapBasicPromptToAutomatic1111Format()](/api/modules#mapbasicprompttoautomatic1111format)
- **Stability AI**: [mapBasicPromptToStabilityFormat()](/api/modules#mapbasicprompttostabilityformat)

### Custom Prompt Formats

You can also create your own custom prompt formats and prompt formats.

For this, you need to:

1. create an interface/type for your prompt format, and
2. create prompt formats that map your prompt format to the prompt formats of the models that you want to use.

The interface for [prompt format](/api/interfaces/PromptFormat) consists of a map function
and a list of stop tokens.

```ts
interface PromptFormat<SOURCE_PROMPT, TARGET_PROMPT> {
  map(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;
}
```

When you have a prompt format that matches the prompt format of a model, you can apply it as follows:

```ts
const modelWithMyCustomPromptFormat = model.withPromptFormat(myPromptFormat);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Stability AI](/integration/model-provider/stability)
- [Automatic1111 (local)](/integration/model-provider/automatic1111)
