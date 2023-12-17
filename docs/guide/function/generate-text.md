---
sidebar_position: 10
---

# Generate Text

Generates text using a [TextGenerationModel](/api/interfaces/TextGenerationModel) and a prompt.
You can also stream the text if it is supported by the model.

The prompt template depends on the model.
For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of chat messages.
You can use [prompt templates](#prompt-format) to change the prompt template of a model.

## Usage

### TextGenerationModel

The different [TextGenerationModel](/api/interfaces/TextGenerationModel) implementations (see [available providers](#available-providers)) share some common settings:

- **maxGenerationTokens**: The maximum number of tokens to generate, or undefined to generate an unlimited number of tokens.
- **numberOfGenerations**: The number of completions to generate.
- **stopSequences**: An array of text sequences that will stop the text generation when they are generated. The sequences are not included in the generated text. The default is an empty array.
- **trimWhitespace**: When true (default), the leading and trailing white space and line terminator characters are removed from the generated text. Only applies to `generateText`.

:::note
Not all models support all common settings. E.g., the `numberOfGenerations` setting is not supported by some local models.
:::

In addition to these common settings, each model exposes its own settings.
The settings can be set in the constructor of the model, or in the `withSettings` method.

### generateText

[generateText API](/api/modules#generatetext)

#### Example: OpenAI text model

```ts
import { generateText, openai } from "modelfusion";

const text = await generateText(
  openai.CompletionTextGenerator(/* ... */),
  "Write a short story about a robot learning to love:\n\n"
);
```

#### Example: OpenAI chat model

```ts
import { generateText, openai } from "modelfusion";

const text = await generateText(openai.ChatTextGenerator(/* ... */), [
  openai.ChatMessage.system(
    "Write a short story about a robot learning to love:"
  ),
]);
```

#### Example: Generate multiple completions

```ts
import { generateText, openai } from "modelfusion";

const { texts } = await generateText(
  openai.CompletionTextGenerator({
    model: "gpt-3.5-turbo-instruct",
    numberOfGenerations: 2,
  }),
  "Write a short story about a robot learning to love:",
  { fullResponse: true }
);
```

#### Example: OpenAI chat model with multi-modal input

Multi-modal vision models such as GPT 4 Vision can process images as part of the prompt.

```ts
import { generateText, openai } from "modelfusion";

const text = await generateText(
  openai.ChatTextGenerator({ model: "gpt-4-vision-preview" }),
  [
    openai.ChatMessage.user([
      { type: "text", text: "Describe the image in detail:" },
      { type: "image", base64Image: image, mimeType: "image/png" },
    ]),
  ]
);
```

### streamText

[streamText API](/api/modules#streamtext)

You can use most text generation models in streaming mode. Just use the `streamText` function instead of `generateText`.

#### Example: OpenAI chat model

```ts
import { streamText, openai } from "modelfusion";

const textStream = await streamText(openai.ChatTextGenerator(/* ... */), [
  openai.ChatMessage.system("You are a story writer. Write a story about:"),
  openai.ChatMessage.user("A robot learning to love"),
]);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

## Prompt Template

[Text generation prompt templates](/api/interfaces/TextGenerationPromptTemplate) change the prompt template that a text generation model accepts. This enables the use of abstracted prompts such as text, instruction or chat prompts.

You can map the prompt of a [TextGenerationModel](/api/interfaces/TextGenerationModel) using the `withPromptTemplate()` method.

For convenience, models with clear prompt templates provide `withTextPrompt()`, `withChatPrompt()`, and `withInstructionPrompt()` methods that automatically apply the correct prompt template.

### Text Prompts

Text prompts are a simple string prompts. They are useful for mapping a simple prompt into the specific prompt template that a model expects.

#### Example: OpenAIChatPrompt

```ts
const model = openai
  .ChatTextGenerator({
    // ...
  })
  .withPromptTemplate(OpenAIChatPrompt.text());
```

[OpenAIChatPrompt.text()](/api/namespaces/OpenAIChatPrompt#text) formats the instruction as an OpenAI message prompt, which is expected by the [OpenAIChatModel](/api/classes/OpenAIChatModel).

Alternatively you can use the shorthand method:

```ts
const model = openai
  .ChatTextGenerator({
    // ...
  })
  .withTextPrompt();
```

You can now generate text using a basic text prompt:

```ts
const text = await generateText(
  model,
  "Write a story about a robot learning to love"
);
```

#### Prompt Templates

The following prompt templates are available for text prompts:

- **OpenAI chat**: [OpenAIChatPrompt.text()](/api/namespaces/OpenAIChatPrompt#text)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- **Anthropic**: [AnthropicPrompt.text()](/api/namespaces/AnthropicPrompt#text)
  for [Anthropic models](/api/classes/AnthropicTextGenerationModel).
- **Llama 2**: [Llama2Prompt.text()](/api/namespaces/Llama2Prompt#text)
  for models that use the [Llama 2 prompt template](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- **Alpaca**: [AlpacaPrompt.text()](/api/namespaces/AlpacaPrompt#text)
  for models that use the [Alpaca prompt template](https://github.com/tatsu-lab/stanford_alpaca#data-release).
- **ChatML**: [ChatMLPrompt.text()](/api/namespaces/ChatMLPrompt#text)
  for models that use the ChatML prompt template.
- **NeuralChat**: [NeuralChatPrompt.text()](/api/namespaces/NeuralChatPrompt#text)
  for models that use the neural chat prompt template.
- **Basic text**: [TextPrompt.text()](/api/namespaces/TextPrompt#text)
  for other models that expect a generic text prompt.

### Instruction Prompts

Instruction prompts are a higher-level prompt templates that contains an instruction and an optional system message. Instruction prompts can be [text instruction prompts](/api/interfaces/TextInstructionPrompt) or [multi-modal instruction prompts](/api/interfaces/MultiModalInstructionPrompt).

The supported instruction prompt type depends on the prompt template that you use. For text instruction prompts, the `instruction` property is a `string`, and for multi-modal instruction prompts it is a [MultiModalInput](/api/modules#multimodalinput). Multi-modal inputs are arrays that can contain text or image content.

#### Example: Cohere text generation

```ts
const model = cohere
  .TextGenerator({
    // ...
  })
  .withPromptTemplate(TextPrompt.instruction());
```

[TextPrompt.instruction()](/api/namespaces/TextPrompt#instruction) formats the instruction prompt as a basic text prompt, which is expected by the [CohereTextGenerationModel](/api/classes/CohereTextGenerationModel).

Alternatively you can use the shorthand method:

```ts
const model = cohere
  .TextGenerator({
    // ...
  })
  .withInstructionPrompt();
```

You can now generate text using an instruction prompt:

```ts
const text = await generateText(model, {
  system: "You are a celebrated poet.", // optional
  instruction: "Write a story about a robot learning to love",
});
```

#### Example: OpenAIChatModel multi-modal input

Multi-modal vision models such as GPT 4 Vision support multi-modal prompts:

```ts
const textStream = await streamText(
  openai
    .ChatTextGenerator({
      model: "gpt-4-vision-preview",
    })
    .withInstructionPrompt(),
  {
    instruction: [
      { type: "text", text: "Describe the image in detail:\n\n" },
      { type: "image", base64Image: image, mimeType: "image/png" },
    ],
  }
);
```

#### Prompt Templates

The following prompt templates are available for instruction prompts:

- **OpenAI chat**: [OpenAIChatPrompt.instruction()](/api/namespaces/OpenAIChatPrompt#instruction)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- **Anthropic**: [AnthropicPrompt.instruction()](/api/namespaces/AnthropicPrompt#instruction)
  for [Anthropic models](/api/classes/AnthropicTextGenerationModel).
- **Llama 2**: [Llama2Prompt.instruction()](/api/namespaces/Llama2Prompt#instruction)
  for models that use the [Llama 2 prompt template](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- **Alpaca**: [AlpacaPrompt.instruction()](/api/namespaces/AlpacaPrompt#instruction)
  for models that use the [Alpaca prompt template](https://github.com/tatsu-lab/stanford_alpaca#data-release).
- **ChatML**: [ChatMLPrompt.instruction()](/api/namespaces/ChatMLPrompt#instruction)
  for models that use the ChatML prompt template.
- **NeuralChat**: [NeuralChatPrompt.instruction()](/api/namespaces/NeuralChatPrompt#instruction)
  for models that use the neural chat prompt template.
- **Basic text**: [TextPrompt.instruction()](/api/namespaces/TextPrompt#instruction)
  for other models that expect a generic text prompt.

### Chat Prompts

Chat prompts are a higher-level prompt template that contains a list of chat messages. They can be either a [TextChatPrompt](/api/interfaces/TextChatPrompt) or a [MultiModalChatPrompt](/api/interfaces/MultiModalChatPrompt).

Chat prompts are a combination of a system message and a list of messages with the following constraints:

- A chat prompt can optionally have a system message.
- The first message of the chat must be a user message.
- Then it must be alternating between an assistant message and a user message.
- The last message must always be a user message (when submitting to a model).

You can use a ChatPrompt without an final user message when you e.g. want to display the current state of a conversation. The type checking is done at runtime when you submit a chat prompt to a model with a prompt template.

#### Example

openai.ChatTextGenerator

```ts
const model = openai
  .ChatTextGenerator({
    model: "gpt-3.5-turbo",
  })
  .withPromptTemplate(OpenAIChatPrompt.chat());
```

The [OpenAIChatPrompt.chat()](/api/namespaces/OpenAIChatPrompt#chat) maps the chat prompt to an OpenAI chat prompt (that is expected by the [OpenAIChatModel](/api/classes/OpenAIChatModel)).

```ts
const model = openai
  .ChatTextGenerator({
    model: "gpt-3.5-turbo",
  })
  .withChatPrompt();
```

You can now generate text using a chat prompt:

```ts
const textStream = await streamText(model, {
  system: "You are a celebrated poet.",
  messages: [
    {
      role: "user",
      content: "Suggest a name for a robot.",
    },
    {
      role: "assistant",
      content: "I suggest the name Robbie",
    },
    {
      role: "user",
      content: "Write a short story about Robbie learning to love",
    },
  ],
});
```

#### Prompt Templates

The following prompt templates are available for chat prompts:

- **OpenAI chat**: [OpenAIChatPrompt.chat()](/api/namespaces/OpenAIChatPrompt#chat)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- **Anthropic**: [AnthropicPrompt.chat()](/api/namespaces/AnthropicPrompt#chat)
  for [Anthropic models](/api/classes/AnthropicTextGenerationModel).
- **Llama 2**: [Llama2Prompt.chat()](/api/namespaces/Llama2Prompt#chat)
  for models that use the [Llama 2 prompt template](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- **Vicuna**: [VicunaPromptTemplate.chat()](/api/namespaces/VicunaPrompt#chat)
  for models that use the [Vicuna prompt template](
- **ChatML**: [ChatMLPrompt.chat()](/api/namespaces/ChatMLPrompt#chat)
  for models that use the ChatML prompt template.
- **NeuralChat**: [NeuralChatPrompt.chat()](/api/namespaces/NeuralChatPrompt#chat)
  for models that use the neural chat prompt template.
- **Basic text**: [TextPrompt.chat()](/api/namespaces/TextPrompt#chat)
  for other models that expect a generic text prompt.
  You can change the prefixes for the user, assistant, and system messages.

### Limiting the chat length

After a while, including all messages from a chat in the prompt can become infeasible, because the context window size is limited.

When you use chat prompts, you can limit the included messages with the [trimChatPrompt()](/api/modules#trimchatprompt) function.
It keeps only the most recent messages in the prompt, while leaving enough space for the completion.

It automatically uses the [context window size](/api/interfaces/TextGenerationModel#contextwindowsize), the [maximum number of completion tokens](/api/interfaces/TextGenerationModel#maxGenerationTokens) and the [tokenizer](/api/interfaces/TextGenerationModel#tokenizer) of the model to determine how many messages to keep. The system message is always included.

#### Example

```ts
const chat: TextChatPrompt = {
  system: `You are a helpful, respectful and honest assistant.`,
  messages: [
    //...
  ],
};

const textStream = await streamText(
  model,
  await trimChatPrompt({ prompt: chat, model })
);
```

### Custom Prompt Templates

You can also create your own custom prompt templates and prompt templates.

For this, you need to:

1. create an interface/type for your prompt template, and
2. create prompt templates that map your prompt template to the prompt templates of the models that you want to use.

The interface for [prompt template](/api/interfaces/TextGenerationPromptTemplate) consists of a map function
and a list of stop tokens.

```ts
interface TextGenerationPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> {
  map(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;
  stopSequences: string[];
}
```

When you have a prompt template that matches the prompt template of a model, you can apply it as follows:

```ts
const modelWithMyCustomPromptTemplate =
  model.withPromptTemplate(myPromptTemplate);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [OpenAI compatible](/integration/model-provider/openaicompatible)
- [Llama.cpp](/integration/model-provider/llamacpp)
- [Ollama](/integration/model-provider/ollama)
- [Mistral](/integration/model-provider/mistral)
- [Hugging Face](/integration/model-provider/huggingface) (no streaming)
- [Cohere](/integration/model-provider/cohere)
- [Anthropic](/integration/model-provider/anthropic)
