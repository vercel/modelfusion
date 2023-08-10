---
sidebar_position: 20
---

# Throttling Strategies

Throttling strategies determine how many parallel API calls are allowed.

## Usage

By default, API calls are not throttled.
You can configure different throttling strategies on models, either in the constructor or as function call parameters.

Throttling can be particularly useful for [text embedding](/guide/function/embed-text), where each `embedText` call can result in multiple API calls.

Different models can share the same throttling strategy. This will result in a shared maximum number of API calls between them.

### throttleMaxConcurrency

[API](/api/modules/#throttleMaxConcurrency)

The `throttleMaxConcurrency` strategy limits the number of parallel API calls.

#### Example: throttleMaxConcurrency in model constructor

```ts
import { throttleMaxConcurrency } from "modelfusion";

const model = new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
  throttle: throttleMaxConcurrency({ maxConcurrentCalls: 10 }),
});
```

### throttleUnlimitedConcurrency

[API](/api/modules/#throttleUnlimitedConcurrency)

The `throttleUnlimitedConcurrency` strategy does not limit parallel API calls.

#### Example: throttleUnlimitedConcurrency in function call

```ts
import { throttleUnlimitedConcurrency } from "modelfusion";

const embeddings = await embedTexts(
  new OpenAITextEmbeddingModel({ model: "text-embedding-ada-002" }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ],
  { settings: { throttle: throttleUnlimitedConcurrency() } }
);
```
