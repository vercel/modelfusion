---
sidebar_position: 10
title: Stability AI
---

# Stability AI

## Setup

1. You can get an API key from [Stability AI](https://platform.stability.ai/docs/getting-started/authentication).
1. The API key can be configured as an environment variable (`STABILITY_API_KEY`) or passed in as an option into the model constructor.

## Usage

[Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/stability)

### Generate Image

[StabilityImageGenerationModel API](/api/classes/StabilityImageGenerationModel)

```ts
import { StabilityImageGenerationModel, generateImage } from "ai-utils.js";

const imageBase64 = await generateImage(
  new StabilityImageGenerationModel({
    model: "stable-diffusion-512-v2-1",
    cfgScale: 7,
    clipGuidancePreset: "FAST_BLUE",
    height: 512,
    width: 512,
    samples: 1,
    steps: 30,
  }),
  [
    { text: "the wicked witch of the west" },
    { text: "style of early 19th century painting", weight: 0.5 },
  ]
);
```
