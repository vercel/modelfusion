---
sidebar_position: 4
title: Hugging Face
---

# Hugging Face

## Setup

1. You can get an API key from [Hugging Face](https://huggingface.co/).
1. The API key can be configured as an environment variable (`HUGGINGFACE_API_KEY`) or passed in as an option into the model constructor.

## Usage

[Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/huggingface)

### Generate Text

[HuggingFaceTextGenerationModel API](/api/classes/HuggingFaceTextGenerationModel)

```ts
import { HuggingFaceTextGenerationModel, generateText } from "ai-utils.js";

const text = await generateText(
  new HuggingFaceTextGenerationModel({
    model: "tiiuae/falcon-7b",
    temperature: 700,
    maxNewTokens: 500,
  }),
  "Write a short story about a robot learning to love:\n\n"
);
```
