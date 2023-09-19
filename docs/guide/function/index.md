---
sidebar_position: 2
title: Model Functions
---

# Model Functions

ModelFusion provides model functions for tasks such as [text generation](/guide/function/generate-text) that are executed using machine learning models (e.g., LLMs).
You can call these functions with a model, a prompt, and additional options.

```ts
const text = await generateText(
  // model:
  new OpenAITextGenerationModel({ model: "gpt-3.5-turbo-instruct" }),

  // prompt (type depends on model):
  "Write a short story about a robot learning to love:\n\n",

  // additional configuration (all optional):
  {
    functionId, // function identifier for logging
    logging, // logging configuration
    observers, // call observers
    run, // run object
  }
);
```

## Rich Responses

For more advanced use cases, you might want to access the full response from the model, or the metadata about the call.
Model functions return rich results that include the original response and metadata when you call `.asFullResponse()` before resolving the promise.

```ts
// access the full response and the metadata:
// the response type is specific to the model that's being used
const { output, response, metadata } = await generateText(
  new OpenAITextGenerationModel({
    model: "gpt-3.5-turbo-instruct",
    maxCompletionTokens: 1000,
    n: 2, // generate 2 completions
  }),
  "Write a short story about a robot learning to love:\n\n"
).asFullResponse();

for (const choice of response.choices) {
  console.log(choice.text);
}

console.log(`Duration: ${metadata.durationInMs}ms`);
```

## Models

Models provide a unified interface to AI models from different [providers](/integration/model-provider/). Models offer the following functionality:

- **Standardized API:** Models provide a standardized API for the tasks that they support. You can use e.g. [ImageGenerationModel](/api/interfaces/ImageGenerationModel)s to [generate images](/guide/function/generate-image), and [TextGenerationModel](/api/interfaces/TextGenerationModel)s to [generate text](/guide/function/generate-text).
- **Settings:** You can configure settings that you can use across many calls to the model, such as the temperature for text generation.
- **Model capability information:** Models provide information about the underlying API capabilities, such as token limits.
- **Fault tolerance**: You can configure retry strategies, throttling, etc.

### Usage

#### new Model

Models are created using a constructor call. The constructors take a single configuration object as an argument. The configuration object is specific to the model.

```ts
const model = new OpenAITextGenerationModel({
  model: "gpt-3.5-turbo-instruct",
  maxCompletionTokens: 500,
});
```

You can pass API configuration objects to the model constructors to configure the underlying API calls. There are preconfigured API configurations for each provider that you can use. The [API configuration](/api/interfaces/ApiConfiguration) contains api keys, base URLs, as well as throttling and retry functions.

```ts
new OpenAITextGenerationModel({
  model: "gpt-3.5-turbo-instruct",
  api: new OpenAIApiConfiguration({
    // all parameters are optional:
    apiKey: "my-api-key",
    baseUrl: "custom-base-url",
    retry: retryWithExponentialBackoff({ maxTries: 5 }),
    throttle: throttleUnlimitedConcurrency(),
  }),
});
```

#### withSettings

The `withSettings` method creates a new model with the same configuration as the original model, but with the specified settings changed.

```ts
const modelWithMoreTokens = model.withSettings({
  maxCompletionTokens: 1000,
});
```
