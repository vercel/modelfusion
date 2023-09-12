---
sidebar_position: 11
title: Automatic1111
---

# AUTOMATIC1111 Stable Diffusion Web UI

Create images with Stable Diffusion using the [AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui). You can run the web UI locally or on a remote server.

## Setup

1. Install [AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) using the instructions in the `stable-diffusion-webui` repository.
2. Start the web UI with the API enabled: `./webui.sh --api` (Mac)

## Configuration

### API Configuration

[Automatic1111 API Configuration](/api/classes/Automatic1111ApiConfiguration)

```ts
const api = new Automatic1111ApiConfiguration({
  // ...
});

const model = new Automatic1111ImageGenerationModel({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/a1111)

### Generate Image

[Automatic1111ImageGenerationModel API](/api/classes/Automatic1111ImageGenerationModel)

```ts
import { Automatic1111ImageGenerationModel, generateImage } from "modelfusion";

const image = await generateImage(
  new Automatic1111ImageGenerationModel({
    model: "aZovyaRPGArtistTools_v3.safetensors [25ba966c5d]",
    steps: 30,
    sampler: "DPM++ 2M Karras",
  }),
  {
    prompt:
      "(the wicked witch of the west) (style of early 19th century painting)",
    negativePrompt:
      "poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb", // ...
  }
);
```
