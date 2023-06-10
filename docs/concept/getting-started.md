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
import { OpenAIImageGenerationModel } from "ai-utils.js";

const model = new OpenAIImageGenerationModel({
  size: "512x512",
});

const image = await model.generateImage(
  "the wicked witch of the west in the style of early 19th century painting"
);
```
