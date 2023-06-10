---
sidebar_position: 1
---

# Getting Started

**⚠️ `ai-utils.js` is currently in its initial experimental phase. Until version 0.1 there may be breaking changes in each release.**

## Installation

```bash
npm install ai-utils.js
```

## Requirements

- [Node.js](https://nodejs.org/en/download/) version 18 or above (for 'fetch' support)

## Usage Examples

### Text Generation

```ts
import { OpenAITextGenerationModel } from "ai-utils.js";

const model = new OpenAITextGenerationModel({
  model: "text-davinci-003",
  temperature: 0.7,
  maxTokens: 500,
});

const text = await model.generateText(
  "Write a short story about a robot learning to love:\n\n"
);
```

### Image Generation

```ts
import { StabilityImageGenerationModel } from "ai-utils.js";

const model = new StabilityImageGenerationModel({
  model: "stable-diffusion-512-v2-1",
  cfgScale: 7,
  clipGuidancePreset: "FAST_BLUE",
  height: 512,
  width: 512,
  samples: 1,
  steps: 30,
});

const image = await model.generateImage([
  { text: "the wicked witch of the west" },
  { text: "style of early 19th century painting", weight: 0.5 },
]);
```
