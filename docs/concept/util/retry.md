---
sidebar_position: 10
---

# Retry Strategies

AI models are often accessed via APIs, and these APIs can fail for a variety of reasons. For example, the API might be temporarily unavailable, or the API provider might have rate limits in place that are exceeded by your application. `ai-utils.js` provides retry strategies that you can configure to handle these situations.

## Usage

By default, API calls use a retry strategy with a maximum of 3 tries and an exponential backoff of initially 2000 ms and a backoff factor of 2.
You can configure different retry strategies on models, either in the constructor or as function call parameters.

### retryWithExponentialBackoff

[API](/api/modules/#retrywithexponentialbackoff)

The `retryWithExponentialBackoff` strategy retries a failed API call with an exponential backoff. You can configure the maximum number of tries, the initial delay, and the backoff factor.

#### Example: retryWithExponentialBackoff in model constructor

```ts
import { retryWithExponentialBackoff } from "ai-utils.js";

const model = new OpenAITextGenerationModel({
  model: // ...,
  retry: retryWithExponentialBackoff({
    maxTries: 8,
    initialDelayInMs: 1000,
    backoffFactor: 2,
  }),
});
```

### retryNever

[API](/api/modules/#retrynever)

The `retryNever` strategy never retries a failed API call.

#### Example: retryWithExponentialBackoff in function call

```ts
import { retryNever } from "ai-utils.js";

const text = await generateText(
  model,
  "Write a short story about a robot learning to love:\n\n",
  { settings: { retry: retryNever() } }
);
```
