---
sidebar_position: 1
---

# Integration Models

The `ai-utils.js` library also provides models. These models map vendor-specific API calls to **higher level** concepts such as text generation. Models include additional functionalities:

- **Additional information:** They provide more information about the API, such as token limits.
- **Defaults:** They set default values for certain parameters (e.g., the value to extract from the response).
- **Configurable settings:** They allow you to customize the API calls according to your needs.

The models enable the separation of parameter configuration from the actual call. This separation is beneficial as most of the time, only the prompt changes, thereby allowing for the integration of API calls into run-aware functions.

### Example Usage

The OpenAI text completion API can be used as a model as shown in the following example:

```ts
const textModel = createOpenAITextModel({
  apiKey: OPENAI_API_KEY,
  model: "text-davinci-003",
  settings: { temperature: 0.7 }, // define settings
});

// Later in the code:
const response = await textModel
  .withSettings({ maxCompletionTokens: 500 }) // refine or override settings
  .generate("Write a short story about a robot learning to love:\n\n");

const text = await textModel.extractOutput(response);

console.log(text);
```

In this example, the createOpenAITextModel function is used to create a text generation model with specific settings. The withSettings function is then used to refine these settings, and the generate function is used to produce a text completion. Finally, the output is extracted using the extractOutput function.

## Models (List)

### Open AI

- [Chat Model](/api/modules/model_openai#createopenaichatmodel)
- [Text Model](/api/modules/model_openai#createopenaitextmodel)
- [Embedding Model](/api/modules/model_openai#createopenaiembeddingmodel)

### Cohere

- [Text Model](/api/modules/model_cohere#createcoheretextmodel)
