---
sidebar_position: 2
title: OpenAI
---

# OpenAI

## Setup

You can sign up for a developer account at [OpenAI](https://platform.openai.com/overview). You can then [create an API key](https://platform.openai.com/account/api-keys) for accessing the OpenAI API.

## Usage

[Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/openai)

The API key can be configured as an environment variable (`OPENAI_API_KEY`) or passed in as an option.

### Text Generation (Text Model)

[API](/api/classes/OpenAITextGenerationModel)

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

### Text Generation (Chat Model)

[API](/api/classes/OpenAIChatModel)

The OpenAI chat models include GPT-3.5-turbo and GPT-4.

```ts
import { OpenAIChatMessage, OpenAIChatModel } from "ai-utils.js";

const model = new OpenAIChatModel({
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  maxTokens: 500,
});

const text = await model.generateText([
  OpenAIChatMessage.system(
    "Write a short story about a robot learning to love:"
  ),
]);
```

### Text Embedding

[API](/api/classes/OpenAITextEmbeddingModel)

```ts
import { OpenAITextEmbeddingModel } from "ai-utils.js";

const model = new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
});

const embeddings = await model.embedTexts([
  "At first, Nox didn't know what to do with the pup.",
  "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
]);
```

### Tokenization (TikToken)

[API](/api/classes/TikTokenTokenizer)

```ts
import { TikTokenTokenizer } from "ai-utils.js";

const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await tokenizer.countTokens(text);
const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```

### Image Generation

OpenAI provides a model called DALL-E that can generate images from text descriptions.

[API](/api/classes/OpenAIImageGenerationModel)

```ts
import { OpenAIImageGenerationModel } from "ai-utils.js";

const model = new OpenAIImageGenerationModel({
  size: "512x512",
});

const imageBase64 = await model.generateImage(
  "the wicked witch of the west in the style of early 19th century painting"
);
```
