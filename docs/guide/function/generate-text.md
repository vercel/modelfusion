---
sidebar_position: 10
---

# Generate Text

Generates text using a [TextGenerationModel](/api/interfaces/TextGenerationModel) and a prompt.
You can also stream the text if it is supported by the model.

The prompt format depends on the model.
For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of chat messages.
You can use [prompt formats](#prompt-format) to change the prompt format of a model.

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
  OpenAIChatMessage.system(
    "Write a short story about a robot learning to love:"
  ),
]);
```

#### Example: OpenAI chat model with multi-modal input

Multi-modal vision models such as GPT 4 Vision can process images as part of the prompt.

```ts
import { generateText, openai } from "modelfusion";

const text = await generateText(
  openai.ChatTextGenerator({ model: "gpt-4-vision-preview" }),
  [
    OpenAIChatMessage.user([
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
  OpenAIChatMessage.system("You are a story writer. Write a story about:"),
  OpenAIChatMessage.user("A robot learning to love"),
]);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

## Prompt Format

[Text generation prompt formats](/api/interfaces/TextGenerationPromptFormat) change the prompt format that a text generation model accepts. This enables the use of abstracted prompts such as text, instruction or chat prompts.

You can map the prompt of a [TextGenerationModel](/api/interfaces/TextGenerationModel) using the `withPromptFormat()` method.

For convenience, models with clear prompt formats provide `withTextPrompt()`, `withChatPrompt()`, and `withInstructionPrompt()` methods that automatically apply the correct prompt format.

### Text Prompts

Text prompts are a simple string prompts. They are useful for mapping a simple prompt into the specific prompt format that a model expects.

#### Example: OpenAIChatPromptFormat

```ts
const model = openai
  .ChatTextGenerator({
    // ...
  })
  .withPromptFormat(OpenAIChatPromptFormat.text());
```

[OpenAIChatPromptFormat.text()](/api/namespaces/OpenAIChatPromptFormat#text) formats the instruction as an OpenAI message prompt, which is expected by the [OpenAIChatModel](/api/classes/OpenAIChatModel).

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

#### Prompt Formats

The following prompt formats are available for text prompts:

- **OpenAI chat**: [OpenAIChatPromptFormat.text()](/api/namespaces/OpenAIChatPromptFormat#text)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- **Anthropic**: [AnthropicPromptFormat.text()](/api/namespaces/AnthropicPromptFormat#text)
  for [Anthropic models](/api/classes/AnthropicTextGenerationModel).
- **Llama 2**: [Llama2PromptFormat.text()](/api/namespaces/Llama2PromptFormat#text)
  for models that use the [Llama 2 prompt format](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- **Alpaca**: [AlpacaPromptFormat.text()](/api/namespaces/AlpacaPromptFormat#text)
  for models that use the [Alpaca prompt format](https://github.com/tatsu-lab/stanford_alpaca#data-release).
- **ChatML**: [ChatMLPromptFormat.text()](/api/namespaces/ChatMLPromptFormat#text)
  for models that use the ChatML prompt format.
- **Basic text**: [TextPromptFormat.text()](/api/namespaces/TextPromptFormat#text)
  for other models that expect a generic text prompt.

### Instruction Prompts

Instruction prompts are a higher-level prompt formats that contains an instruction and an optional system message. Instruction prompts can be [text instruction prompts](/api/interfaces/TextInstructionPrompt) or [multi-modal instruction prompts](/api/interfaces/MultiModalInstructionPrompt).

The supported instruction prompt type depends on the prompt format that you use. For text instruction prompts, the `instruction` property is a `string`, and for multi-modal instruction prompts it is a [MultiModalInput](/api/modules#multimodalinput). Multi-modal inputs are arrays that can contain text or image content.

#### Example: Cohere text generation

```ts
const model = cohere
  .TextGenerator({
    // ...
  })
  .withPromptFormat(TextPromptFormat.instruction());
```

[TextPromptFormat.instruction()](/api/namespaces/TextPromptFormat#instruction) formats the instruction prompt as a basic text prompt, which is expected by the [CohereTextGenerationModel](/api/classes/CohereTextGenerationModel).

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

#### Prompt Formats

The following prompt formats are available for instruction prompts:

- **OpenAI chat**: [OpenAIChatPromptFormat.instruction()](/api/namespaces/OpenAIChatPromptFormat#instruction)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- **Anthropic**: [AnthropicPromptFormat.instruction()](/api/namespaces/AnthropicPromptFormat#instruction)
  for [Anthropic models](/api/classes/AnthropicTextGenerationModel).
- **Llama 2**: [Llama2PromptFormat.instruction()](/api/namespaces/Llama2PromptFormat#instruction)
  for models that use the [Llama 2 prompt format](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- **Alpaca**: [AlpacaPromptFormat.instruction()](/api/namespaces/AlpacaPromptFormat#instruction)
  for models that use the [Alpaca prompt format](https://github.com/tatsu-lab/stanford_alpaca#data-release).
- **ChatML**: [ChatMLPromptFormat.instruction()](/api/namespaces/ChatMLPromptFormat#instruction)
  for models that use the ChatML prompt format.
- **Basic text**: [TextPromptFormat.instruction()](/api/namespaces/TextPromptFormat#instruction)
  for other models that expect a generic text prompt.

### Chat Prompts

[Chat prompts](/api/interfaces/ChatPrompt) are a higher-level prompt format that contains a list of chat messages.

Chat prompts are a combination of a system message and a list of messages with the following constraints:

- A chat prompt can optionally have a system message.
- The first message of the chat must be a user message.
- Then it must be alternating between an assistant message and a user message.
- The last message must always be a user message (when submitting to a model).

You can use a ChatPrompt without an final user message when you e.g. want to display the current state of a conversation. The type checking is done at runtime when you submit a chat prompt to a model with a prompt format.

#### Example

openai.ChatTextGenerator

```ts
const model = openai
  .ChatTextGenerator({
    model: "gpt-3.5-turbo",
  })
  .withPromptFormat(OpenAIChatPromptFormat.chat());
```

The [OpenAIChatPromptFormat.chat()](/api/namespaces/OpenAIChatPromptFormat#chat) maps the chat prompt to an OpenAI chat prompt (that is expected by the [OpenAIChatModel](/api/classes/OpenAIChatModel)).
openai.ChatTextGenerator
Alternatively you can use the shorthand method:
openai.ChatTexopenai.ChatTextGenerator

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

#### Prompt Formats

The following prompt formats are available for chat prompts:

- **OpenAI chat**: [OpenAIChatPromptFormat.chat()](/api/namespaces/OpenAIChatPromptFormat#chat)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- **Anthropic**: [AnthropicPromptFormat.chat()](/api/namespaces/AnthropicPromptFormat#chat)
  for [Anthropic models](/api/classes/AnthropicTextGenerationModel).
- **Llama 2**: [Llama2PromptFormat.chat()](/api/namespaces/Llama2PromptFormat#chat)
  for models that use the [Llama 2 prompt format](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- **Vicuna**: [VicunaPromptFormat.chat()](/api/namespaces/VicunaPromptFormat#chat)
  for models that use the [Vicuna prompt format](
- **ChatML**: [ChatMLPromptFormat.chat()](/api/namespaces/ChatMLPromptFormat#chat)
  for models that use the ChatML prompt format.
- **Basic text**: [TextPromptFormat.chat()](/api/namespaces/TextPromptFormat#chat)
  for other models that expect a generic text prompt.
  You can change the prefixes for the user, assistant, and system messages.

### Limiting the chat length

After a while, including all messages from a chat in the prompt can become infeasible, because the context window size is limited.

When you use chat prompts, you can limit the included messages with the [trimChatPrompt()](/api/modules#trimchatprompt) function.
It keeps only the most recent messages in the prompt, while leaving enough space for the completion.

It automatically uses the [context window size](/api/interfaces/TextGenerationModel#contextwindowsize), the [maximum number of completion tokens](/api/interfaces/TextGenerationModel#maxcompletiontokens) and the [tokenizer](/api/interfaces/TextGenerationModel#tokenizer) of the model to determine how many messages to keep. The system message is always included.

#### Example

```ts
const chat: ChatPrompt = {
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

### Custom Prompt Formats

You can also create your own custom prompt formats and prompt formats.

For this, you need to:

1. create an interface/type for your prompt format, and
2. create prompt formats that map your prompt format to the prompt formats of the models that you want to use.

The interface for [prompt format](/api/interfaces/TextGenerationPromptFormat) consists of a map function
and a list of stop tokens.

```ts
interface TextGenerationPromptFormat<SOURCE_PROMPT, TARGET_PROMPT> {
  map(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;
  stopSequences: string[];
}
```

When you have a prompt format that matches the prompt format of a model, you can apply it as follows:

```ts
const modelWithMyCustomPromptFormat = model.withPromptFormat(myPromptFormat);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Anthropic](/integration/model-provider/anthropic)
- [Cohere](/integration/model-provider/cohere)
- [Llama.cpp](/integration/model-provider/llamacpp)
- [Ollama](/integration/model-provider/ollama)
- [Hugging Face](/integration/model-provider/huggingface) (no streaming)
