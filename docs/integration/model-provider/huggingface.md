---
sidebar_position: 4
title: Hugging Face
---

# Hugging Face

## Setup

You can get an API key from [Hugging Face](https://huggingface.co/).

## Usage

[Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/huggingface)

The API key can be configured as an environment variable (`HUGGINGFACE_API_KEY`) or passed in as an option.

### Text Generation

[API](/api/classes/HuggingFaceTextGenerationModel)

```ts
import { HuggingFaceTextGenerationModel } from "ai-utils.js";

const textGenerationModel = new HuggingFaceTextGenerationModel({
  model: "tiiuae/falcon-7b",
  temperature: 700,
  maxNewTokens: 500,
});

const text = await textGenerationModel.generateText(
  "Write a short story about a robot learning to love:\n\n"
);
```
