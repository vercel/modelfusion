---
sidebar_position: 2
title: Model Functions
---

# Model Functions

ModelFusion provides model functions for tasks such as [text generation](/guide/function/generate-text) that are executed using machine learning models (e.g., LLMs).
You can call these functions with a model, a prompt, and additional [FunctionOptions](/api/modules#functionoptions).

```ts
import { generateText, openai } from "modelfusion";

const text = await generateText({
  // model (determines the prompt type)
  model: openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),

  // prompt (type depends on model):
  prompt: "Write a short story about a robot learning to love:\n\n",

  // additional configuration (all optional):
  functionId, // function identifier for logging
  callId, // call ID of the parent ModelFusion call (for tracing)
  logging, // logging configuration
  observers, // call observers
  run, // run object
  cache, // optional catch (only supported by generateText at the moment)
});
```

:::tip
The basic examples are a great way to get started and to explore in parallel with this documentation. You can find them in the [examples/basic](https://github.com/lgrammel/modelfusion/tree/main/examples/basic) folder.
:::

## Streaming Functions

Some model functions have a streaming variant, e.g. `streamText` or `streamSpeech`. The streaming functions return `AsyncIterable` objects and might only work with some models.

## Rich Responses

For more advanced use cases, you might want to access the full response from the model, or the metadata about the call.
Model functions return rich results that include the original response and metadata when you set the `fullResponse` option to `true`.

```ts
import { generateText, openai } from "modelfusion";

// access the raw (original) response (needs to be typed) and the metadata:
const { text, texts, rawResponse, metadata } = await generateText({
  model: openai.CompletionTextGenerator({
    model: "gpt-3.5-turbo-instruct",
    maxGenerationTokens: 1000,
    n: 2, // generate 2 completions
  }),
  prompt: "Write a short story about a robot learning to love:\n\n",

  fullResponse: true, // enable rich response
});

console.log(metadata);

// cast to the raw response type:
for (const choice of (rawResponse as OpenAICompletionResponse).choices) {
  console.log(choice.text);
}
```

## Models

Models provide a unified interface to AI models from different [providers](/integration/model-provider/). Models offer the following functionality:

- **Standardized API:** Models provide a standardized API for the tasks that they support. You can use e.g. [ImageGenerationModel](/api/interfaces/ImageGenerationModel)s to [generate images](/guide/function/generate-image), and [TextGenerationModel](/api/interfaces/TextGenerationModel)s to [generate text](/guide/function/generate-text).
- **Settings:** You can configure settings that you can use across many calls to the model, such as the temperature for text generation.
- **Model capability information:** Models provide information about the underlying API capabilities, such as token limits.
- **Fault tolerance**: You can configure retry strategies, throttling, etc.

### Usage

#### Creating Models

Models are created using the provider facades. Each provider is exposed as a namespace, e.g. `openai`, and contains factory functions for creating models, e.g. `CompletionTextGenerator` or `ChatTextGenerator`. These factory functions take a single configuration object as an argument. The configuration object is specific to the model.

```ts
import { openai } from "modelfusion";

const model = openai.CompletionTextGenerator({
  model: "gpt-3.5-turbo-instruct",
  maxGenerationTokens: 500,
});
```

You can pass [API configuration](/guide/util/api-configuration/) objects to the factory functions to configure the underlying API calls. There are pre-configured API configurations for each provider that you can use. The API configuration contains api keys, base URLs, as well as throttling and retry functions.

```ts
import { api, openai } from "modelfusion";

openai.CompletionTextGenerator({
  model: "gpt-3.5-turbo-instruct",
  api: openai.Api({
    // all parameters are optional:
    apiKey: "my-api-key",
    baseUrl: {
      host: "my-proxy-host",
    },
    retry: api.retryWithExponentialBackoff({ maxTries: 5 }),
    throttle: api.throttleOff(),
  }),
});
```

#### withSettings

The `withSettings` method creates a new model with the same configuration as the original model, but with the specified settings changed.

```ts
const modelWithMoreTokens = model.withSettings({
  maxGenerationTokens: 1000,
});
```
