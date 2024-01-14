---
sidebar_position: 3
title: OpenAI Compatible
---

# OpenAI Compatible

Many AI hosting providers offer an OpenAI-compatible API. ModelFusion supports these providers out of the box.

You only need to provide an API configuration, e.g. using [custom API configurations](/guide/util/api-configuration/). For several OpenAI-compatible providers ModelFusion contains pre-configured API configurations:

- [Fireworks AI](/api/classes/FireworksAIApiConfiguration): `openaicompatible.FireworksAIApi()`
- [Together AI](/api/classes/TogetherAIApiConfiguration): `openaicompatible.TogetherAIApi()`
- [Perplexity](/api/classes/PerplexityApiConfiguration): `openaicompatible.PerplexityApi()`

:::note
Please note that many providers implement the OpenAI API with slight differences, which can cause
unexpected errors and different behavior in less common scenarios.
:::

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/openaicompatible)

### Generate Text

#### Chat Model

[OpenAICompatibleChatModel API](/api/classes/OpenAICompatibleChatModel)

```ts
import {
  BaseUrlApiConfiguration,
  openaicompatible,
  generateText,
} from "modelfusion";

const text = await generateText({
  model: openaicompatible
    .ChatTextGenerator({
      api: openaicompatible.FireworksAIApi(), // or other OpenAI-compatible API
      provider: "openaicompatible-fireworksai", // optional
      model: "accounts/fireworks/models/llama-v2-7b-chat",
    })
    .withTextPrompt(),

  prompt: "Write a story about a robot learning to love",
});
```

#### Completion Model

[OpenAICompatibleCompletionModel API](/api/classes/OpenAICompatibleCompletionModel)

```ts
import {
  BaseUrlApiConfiguration,
  openaicompatible,
  generateText,
} from "modelfusion";

const text = await generateText({
  model: openaicompatible.CompletionTextGenerator({
    api: openaicompatible.FireworksAIApi(), // or other OpenAI-compatible API
    provider: "openaicompatible-fireworksai", // optional
    model: "accounts/fireworks/models/mistral-7b",
  }),

  prompt: "Write a story about a robot learning to love",
});
```

### Stream Text

#### Chat Model

[OpenAICompatibleChatModel API](/api/classes/OpenAICompatibleChatModel)

```ts
import {
  BaseUrlApiConfiguration,
  openaicompatible,
  streamText,
} from "modelfusion";

const textStream = await streamText({
  model: openaicompatible
    .ChatTextGenerator({
      api: openaicompatible.FireworksAIApi(), // or other OpenAI-compatible API
      provider: "openaicompatible-fireworksai", // optional
      model: "accounts/fireworks/models/llama-v2-7b-chat",
    })
    .withTextPrompt(),

  prompt: "Write a story about a robot learning to love",
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

#### Completion Model

[OpenAICompatibleCompletionModel API](/api/classes/OpenAICompatibleCompletionModel)

```ts
import {
  BaseUrlApiConfiguration,
  openaicompatible,
  streamText,
} from "modelfusion";

const textStream = await streamText({
  model: openaicompatible.CompletionTextGenerator({
    api: openaicompatible.FireworksAIApi(), // or other OpenAI-compatible API
    provider: "openaicompatible-fireworksai", // optional
    model: "accounts/fireworks/models/mistral-7b",
  }),

  prompt: "Write a story about a robot learning to love",
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Embed Text

[OpenAITextCompatibleEmbeddingModel API](/api/classes/OpenAICompatibleTextEmbeddingModel)

```ts
import { embed, openaicompatible } from "modelfusion";

const embedding = await embed({
  model: openaicompatible.TextEmbedder({
    api: openaicompatible.TogetherAIApi(), // or other OpenAI-compatible API
    provider: "openaicompatible-togetherai", //optional
    model: "togethercomputer/m2-bert-80M-8k-retrieval",
  }),
  value: "At first, Nox didn't know what to do with the pup.",
});
```
