---
sidebar_position: 50
title: Automatic1111
---

# AUTOMATIC1111 Stable Diffusion Web UI

Create images with Stable Diffusion using the [AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui). You can run the web UI locally or on a remote server.

## Setup

1. Install [AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) using the instructions in the `stable-diffusion-webui` repository.
2. Start the web UI with the API enabled: `./webui.sh --api` (Mac)
   - Tip: `--nowebui` disables the UI (port changes to 7861)

## Configuration

### API Configuration

[Automatic1111 API Configuration](/api/classes/Automatic1111ApiConfiguration)

```ts
const api = automatic1111.Api({
  baseUrl: {
    port: "7861", // example: set port for --nowebui mode
  },
  // ...
});

const model = automatic1111.ImageGenerator({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/a1111)

### Generate Image

[Automatic1111ImageGenerationModel API](/api/classes/Automatic1111ImageGenerationModel)

```ts
import { automatic1111, generateImage } from "modelfusion";

const image = await generateImage(
  automatic1111.ImageGenerator({
    model: "aZovyaRPGArtistTools_v4.safetensors",
    steps: 30,
    sampler: "DPM++ 2M Karras",
    width: 512,
    height: 512,
  }),
  {
    prompt:
      "(the wicked witch of the west) (style of early 19th century painting)",
    negativePrompt:
      "poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb", // optional negative prompt
    seed: 123, // optional seed
  }
);
```

## Prompt Template

### Basic text prompt

You an use [mapBasicPromptToAutomatic1111Format()](/api/modules#mapbasicprompttoautomatic1111format) to use text prompts with Automatic1111 models. It is available as a shorthand method:

```ts
const image = await generateImage(
  automatic1111
    .ImageGenerator({
      //...
    })
    .withTextPrompt(),
  "the wicked witch of the west in the style of early 19th century painting"
);
```
