---
sidebar_position: 2
title: Model Functions
---

# Model Functions

`ai-utils.js` provides model functions for tasks such as [text generation](/concept/function/generate-text) that are executed using machien learning models (e.g., LLMs).
You can call these functions with a model, a prompt, and additional options.

```ts
const text = await generateText(
  // model:
  new OpenAITextGenerationModel({ model: "text-davinci-003" }),
  // prompt (type depends on model):
  "Write a short story about a robot learning to love:\n\n",
  // additional options:
  { run }
);
```

## Models

Models provide a unified interface to AI models from different [providers](/integration/model-provider/). Models offer the following functionality:

- **Standardized API:** Models provide a standardized API for the tasks that they support. You can use e.g. [ImageGenerationModel](/api/interfaces/ImageGenerationModel)s to [generate images](/concept/function/generate-image), and [TextGenerationModel](/api/interfaces/TextGenerationModel)s to [generate text](/concept/function/generate-text).
- **Settings:** You can configure settings that you can use across many calls to the model, such as the temperature for text generation.
- **Model capability information:** Models provide information about the underlying API capabilities, such as token limits.
- **Fault tolerance**: You can configure retry strategies, throttling, etc.

### Usage

#### new Model

Models are created using a constructor call. The constructors take a single configuration object as an argument. The configuration object is specific to the model.

```ts
const model = new OpenAITextGenerationModel({
  model: "text-davinci-003",
  maxTokens: 500,
});
```

#### withSettings

The `withSettings` method creates a new model with the same configuration as the original model, but with the specified settings changed.

```ts
const modelWithMoreTokens = model.withSettings({
  maxTokens: 1000,
});
```

## Additional function features

Functions offer the following additional functionality:

- **Observable**: You can receive events for the start and finish of calls to the model.
- **Run support**: You can pass a [Run](/concept/run/) as an option, which you can use to control and monitor the execution of the function.
- **Settings override**: You can override the settings of the model for a single call to the function.
