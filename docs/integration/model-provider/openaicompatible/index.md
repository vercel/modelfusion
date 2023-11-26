---
sidebar_position: 3
title: OpenAI Compatible
---

# OpenAI Compatible

Many AI hosting providers offer an OpenAI-compatible API. ModelFusion supports these providers out of the box.
You only need to provide an API configuration, e.g. using [BaseUrlApiConfiguration](/api/classes/BaseUrlApiConfiguration). For several providers there also pre-configured API configurations.

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

const text = await generateText(
  openaicompatible
    .ChatTextGenerator({
      api: new BaseUrlApiConfiguration({
        baseUrl: "https://api.fireworks.ai/inference/v1",
        headers: {
          Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
        },
      }),
      model: "accounts/fireworks/models/mistral-7b",
    })
    .withTextPrompt(),

  "Write a story about a robot learning to love"
);
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

const textStream = await streamText(
  openaicompatible
    .ChatTextGenerator({
      api: new BaseUrlApiConfiguration({
        baseUrl: "https://api.fireworks.ai/inference/v1",
        headers: {
          Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
        },
      }),
      model: "accounts/fireworks/models/mistral-7b",
    })
    .withTextPrompt(),

  "Write a story about a robot learning to love"
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```
