---
sidebar_position: 3
---

# Generate and Stream Text

Generates text using a [TextGenerationModel](/api/interfaces/TextGenerationModel) and a prompt.
You can also stream the text if it is supported by the model.

The prompt format depends on the model.
For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of chat messages.
You can use [prompt formats](/guide/function/generate-text/prompt-format) to change the prompt format of a model.

## Usage

### TextGenerationModel

The different [TextGenerationModel](/api/interfaces/TextGenerationModel) implementations (see [available providers](#available-providers)) share some common settings:

- **maxCompletionTokens**: The maximum number of tokens to generate, or undefined to generate an unlimited number of tokens.
- **stopSequences**: An array of text sequences that will stop the text generation when they are generated. The sequences are not included in the generated text. The default is an empty array.
- **trimWhitespace**: When true (default), the leading and trailing white space and line terminator characters are removed from the generated text. Only applies to `generateText`.

In addition to these common settings, each model exposes its own settings.
The settings can be set in the constructor of the model, or in the `withSettings` method.

### generateText

[generateText API](/api/modules#generatetext)

#### With OpenAI text model

```ts
const text = await generateText(
  new OpenAICompletionModel(/* ... */),
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

#### With HuggingFace image captioning model

You can also use models that take an image as input, such as image captioning models.

```ts
const imageResponse = await fetch(imageUrl);
const data = Buffer.from(await imageResponse.arrayBuffer());

const text = await generateText(
  new HuggingFaceImageDescriptionModel({
    model: "nlpconnect/vit-gpt2-image-captioning",
  }),
  data
);
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
