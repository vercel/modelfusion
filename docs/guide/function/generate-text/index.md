---
sidebar_position: 3
---

# Generate and Stream Text

Generates text using a [TextGenerationModel](/api/interfaces/TextGenerationModel) and a prompt.
You can also stream the text if it is supported by the model.

The prompt format depends on the model.
For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of chat messages.
You can use [prompt mappings](/guide/function/generate-text/prompt-mapping) to change the prompt format of a model.

## Usage

### generateText

[generateText API](/api/modules#generatetext)

#### With OpenAI text model

```ts
const text = await generateText(
  new OpenAITextGenerationModel(/* ... */),
  "Write a short story about a robot learning to love:\n\n"
);
```

#### With OpenAI chat model

```ts
const text = await generateText(new OpenAIChatModel(/* ... */), [
  OpenAIChatMessage.system(
    "Write a short story about a robot learning to love:"
  ),
]);
```

### streamText

[streamText API](/api/modules#streamtext)

#### With OpenAI chat model

```ts
const textStream = await streamText(new OpenAIChatModel(/* ... */), [
  OpenAIChatMessage.system("You are a story writer. Write a story about:"),
  OpenAIChatMessage.user("A robot learning to love"),
]);

for await (const textFragment of textStream) {
  process.stdout.write(textFragment);
}
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Cohere](/integration/model-provider/cohere)
- [Llama.cpp](/integration/model-provider/llamacpp)
- [Hugging Face](/integration/model-provider/huggingface) (no streaming)
