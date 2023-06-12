---
sidebar_position: 1
---

# Models

Models are the main abstraction in `ai-utils.js`. They provide a unified interface to AI models from different providers. Models offer the following functionality:

- **Standardized API:** Models provide a standardized API for different AI models, e.g. for text generation.
- **Settings:** You can configure settings that you can use across many calls to the model, such as the temperature for text generation.
- **Model capability information:** Models provide information about the underlying API capabilities, such as token limits.
- **Fault tolerance**: You can configure retry strategies, throttling, etc.
- **Observable**: You can easily observe the start and finish of calls to the model.

## Usage

[Model API](/api/interfaces/Model)

### new Model

Models are created using a constructor call. The constructors take a single configuration object as an argument. The configuration object is specific to the model.

#### Example: OpenAITextGenerationModel

```ts
const model = new OpenAITextGenerationModel({
  model: "text-davinci-003",
  maxTokens: 500,
});
```

### withSettings

The `withSettings` method creates a new model with the same configuration as the original model, but with the specified settings changed.

#### Example

```ts
const modelWithMoreTokens = model.withSettings({
  maxTokens: 1000,
});
```
