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

#### Example

```ts
import { openai, api } from "modelfusion";

const model = openai.TextEmbedder({
  api: openai.Api({
    throttle: api.throttleMaxConcurrency({ maxConcurrentCalls: 10 }),
  }),
  model: "text-embedding-ada-002",
});
```

### throttleOff

[API](/api/modules/#throttleOff)

The `throttleOff` strategy does not limit parallel API calls.

#### Example

```ts
import { openai, api } from "modelfusion";

const model = openai.TextEmbedder({
  api: openai.Api({
    throttle: api.throttleOff({ maxConcurrentCalls: 10 }),
  }),
  model: "text-embedding-ada-002",
  api,
});
```
