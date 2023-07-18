---
sidebar_position: 3
---

# Generate Text

Generates text using a prompt.

## Usage

### generateText

[generateText API](/api/modules#generatetext)

Generates a text using a prompt.
The prompt format depends on the model.
For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of chat messages.

#### With OpenAI text model

```ts
const text = await generateText(
  new OpenAITextGenerationModel(/* ... */),
  "Write a short story about a robot learning to love:\n\n"
);
```

#### With OpenAI chat model

```ts
const text = await generateText(
  new OpenAIChatModel({
    /* ... */
  }),
  [
    OpenAIChatMessage.system(
      "Write a short story about a robot learning to love:"
    ),
  ]
);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Cohere](/integration/model-provider/cohere)
- [Hugging Face](/integration/model-provider/huggingface)
- [Llama.cpp](/integration/model-provider/llamacpp)
