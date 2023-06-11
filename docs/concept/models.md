---
sidebar_position: 1
---

# Models

Provider models map provider-specific API calls to library functions such as text generation and embedding. They are implemented as classes and are immutable. Models include additional functionalities:

- **Additional information:** They provide more information about the underlying API capabilities, such as token limits.
- **Defaults:** They set default values for specific parameters (e.g., the value to extract from the response).
- **Configurable settings:** They allow you to customize the API calls according to your needs.
- **Retry management**: You can configure the retry strategy on the models.
- **Throttling**: You can set the throttling strategy on the models. The same throttling strategy can be shared by multiple models to ensure that API rate limits are respected across models.

The models enable the separation of configuration parameters from the actual call. This separation is necessary to integrate the models into the library functions while letting you configure the parameters for the underlying API calls.

## Usage

[Model API](/api/interfaces/Model)

### new Model

Models are created using a constructor call. The constructors take a single configuration object as an argument. The configuration object is specific to the model.

#### Example: OpenAITextGenerationModel

```ts
const model = new OpenAITextGenerationModel({
  // configure model settings, e.g. model name and maxTokens:
  model: "text-davinci-003",
  maxTokens: 500,

  // configure retries (optional, retries enabled by default)
  retry: retryWithExponentialBackoff({
    maxTries: 8,
    initialDelayInMs: 1000,
    backoffFactor: 2,
  }),

  // configure throttling (optional, calls throttled by default)
  throttle: throttleMaxConcurrency({ maxConcurrentCalls: 10 }),
});
```

### withSettings

The `withSettings` method creates a new model with the same configuration as the original model, but with the specified settings changed.

#### Example

```ts
const model = new OpenAITextGenerationModel({
  model: "text-davinci-003",
  maxTokens: 500,
});

const modelWithMoreTokens = model.withSettings({
  maxTokens: 1000,
});
```
