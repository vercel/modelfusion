---
sidebar_position: 5
---

# Stability AI

[API documentation](/api/modules/provider_stability)
|
[Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/provider/stability)

## Import

```ts
import { StabilityImageGenerationModel, ... } from "ai-utils.js/provider/stability";
```

## Example

```ts
const imageGenerationModel = new StabilityImageGenerationModel({
  apiKey: STABILITY_API_KEY,
  model: "stable-diffusion-512-v2-1",
  settings: {
    cfgScale: 7,
    clipGuidancePreset: "FAST_BLUE",
    height: 512,
    width: 512,
    samples: 1,
    steps: 30,
  },
});

const imageResponse = await imageGenerationModel.generate([
  { text: "the wicked witch of the west" },
  { text: "style of early 19th century painting", weight: 0.5 },
]);

const image = await imageGenerationModel.extractImageBase64(imageResponse);
```

## Models

- [Image Generation Model](/api/classes/provider_stability.StabilityImageGenerationModel)

## API Clients

- [Image Generation](/api/modules/provider_stability#generatestabilityimage)
