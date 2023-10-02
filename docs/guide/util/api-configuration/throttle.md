---
sidebar_position: 20
---

# Throttling Strategies

Throttling strategies determine how many parallel API calls are allowed.

## Usage

By default, API calls are not throttled.
You can configure different throttling strategies on API configurations.

Throttling can be particularly useful for [text embedding](/guide/function/embed), where each `embed` call can result in multiple API calls.

### throttleMaxConcurrency

[API](/api/modules/#throttleMaxConcurrency)

The `throttleMaxConcurrency` strategy limits the number of parallel API calls.

#### Example: throttleMaxConcurrency in model constructor

```ts
import { throttleMaxConcurrency } from "modelfusion";

const api = new OpenAIApiConfiguration({
  throttle: throttleMaxConcurrency({ maxConcurrentCalls: 10 }),
});

const model = new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
  api,
});
```

### throttleUnlimitedConcurrency

[API](/api/modules/#throttleUnlimitedConcurrency)

The `throttleUnlimitedConcurrency` strategy does not limit parallel API calls.

#### Example: throttleUnlimitedConcurrency in function call

```ts
import { throttleUnlimitedConcurrency } from "modelfusion";

const api = new OpenAIApiConfiguration({
  throttle: throttleUnlimitedConcurrency(),
});

new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
  api,
});
```
