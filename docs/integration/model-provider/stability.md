---
sidebar_position: 51
title: Stability AI
---

# Stability AI

## Setup

1. You can get an API key from [Stability AI](https://platform.stability.ai/docs/getting-started/authentication).
1. The API key can be configured as an environment variable (`STABILITY_API_KEY`) or passed in as an option into the model constructor.

## Configuration

### API Configuration

[Stability API Configuration](/api/classes/StabilityApiConfiguration)

```ts
const api = stability.Api({
  apiKey: "my-api-key",
  // ...
});

const model = stability.ImageGenerator({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/stability)

### Generate Image

[StabilityImageGenerationModel API](/api/classes/StabilityImageGenerationModel)

```ts
import { stability, generateImage } from "modelfusion";

const imageBase64 = await generateImage(
  stability.ImageGenerator({
    model: "stable-diffusion-v1-6",
    cfgScale: 7,
    clipGuidancePreset: "FAST_BLUE",
    height: 512,
    width: 512,
    steps: 30,
  }),
  [
    { text: "the wicked witch of the west" },
    { text: "style of early 19th century painting", weight: 0.5 },
  ]
);
```

## Prompt Template

### Basic text prompt

You an use [mapBasicPromptToStabilityFormat()](/api/modules#mapbasicprompttostabilityformat) to use text prompts with Stability models. It is available as a shorthand method:

```ts
const image = await generateImage(
  stability
    .ImageGenerator({
      //...
    })
    .withTextPrompt(),
  "the wicked witch of the west in the style of early 19th century painting"
);
```
