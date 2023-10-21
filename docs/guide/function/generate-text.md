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

## Prompt Format

[Text generation prompt formats](/api/interfaces/TextGenerationPromptFormat) change the prompt format that a text generation model accepts.
This enables the use of abstracted prompts such as [instruction](/api/modules#instructionprompt) or [chat](/api/modules#chatprompt) prompts.

You can map the prompt of a [TextGenerationModel](/api/interfaces/TextGenerationModel) using the `withPromptFormat()` method. The built-in prompt formats are functions that follow the pattern `map[Chat|Instruction]PromptTo[FORMAT]Format()`, e.g. `mapInstructionPromptToAlpacaFormat()`.

For convience, models with clear prompt formats have a `withChatPrompt()` or `withInstructionPrompt()` method that automatically applies the correct prompt format.

### Instruction Prompts

[Instruction prompts](/api/modules#instructionprompt) are a higher-level prompt format that contains an instruction, an optional input, and an optional system message. For some models, changing the system message can affect the results, so consider how your model works before setting it.

#### Example

```ts
const model = new CohereTextGenerationModel({
  // ...
}).withPromptFormat(mapInstructionPromptToTextFormat());
```

[mapInstructionPromptToTextFormat()](/api/modules#mapinstructionprompttotextformat) formats the instruction prompt as a basic text prompt, which is expected by the [CohereTextGenerationModel](/api/classes/CohereTextGenerationModel).

Alternatively you can use the shorthand method:

```ts
const model = new CohereTextGenerationModel({
  // ...
}).withInstructionPrompt();
```

You can now generate text using an instruction prompt:

```ts
const text = await generateText(model, {
  system: "You are a celebrated poet.", // optional
  instruction: "Write a short story about:",
  input: "a robot learning to love", // optional
});
```

#### Prompt Formats

The following prompt formats are available for instruction prompts:

- **OpenAI chat**: [mapInstructionPromptToOpenAIChatFormat()](/api/modules#mapinstructionprompttoopenaichatformat)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- **Anthropic**: [mapInstructionPromptToAnthropicFormat()](/api/modules#mapinstructionprompttoanthropicformat)
  for [Anthropic models](/api/classes/AnthropicTextGenerationModel).
- **Llama 2**: [mapInstructionPromptToLlama2Format()](/api/modules#mapinstructionprompttollama2format)
  for models that use the [Llama 2 prompt format](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- **Alpaca**: [mapInstructionPromptToAlpacaFormat()](/api/modules#mapinstructionprompttoalpacaformat)
  for models that use the [Alpaca prompt format](https://github.com/tatsu-lab/stanford_alpaca#data-release).
- **Basic text**: [mapInstructionPromptToTextFormat()](/api/modules#mapinstructionprompttotextformat)
  for other models that expect a generic text prompt.

### Chat Prompts

[Chat prompts](/api/modules#chatprompt) are a higher-level prompt format that contains a list of chat messages.

Chat prompts are an array with several constraints that are checked at runtime:

- A chat prompt can optionally start with a system message.
- After the optional system message, the first message of the chat must be a user message.
- Then it must be alternating between an ai message and a user message.
- The last message must always be a user message.

#### Example

```ts
const model = new OpenAIChatModel({
  model: "gpt-3.5-turbo",
}).withPromptFormat(mapChatPromptToOpenAIChatFormat());
```

The [mapChatPromptToOpenAIChatFormat](/api/modules#mapchatprompttoopenaichatformat) maps the chat prompt to an OpenAI chat prompt (that is expected by the [OpenAIChatModel](/api/classes/OpenAIChatModel)).

Alternatively you can use the shorthand method:

```ts
const model = new OpenAIChatModel({
  model: "gpt-3.5-turbo",
}).withChatPrompt();
```

You can now generate text using a chat prompt:

```ts
const textStream = await streamText(model, [
  { system: "You are a celebrated poet." },
  { user: "Write a short story about a robot learning to love." },
  { ai: "Once upon a time, there was a robot who learned to love." },
  { user: "That's a great start!" },
]);
```

#### Prompt Formats

The following prompt formats are available for chat prompts:

- **OpenAI chat**: [mapChatPromptToOpenAIChatFormat()](/api/modules#mapchatprompttoopenaichatformat)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- **Anthropic**: [mapChatPromptToAnthropicFormat()](/api/modules#mapchatprompttoanthropicformat)
  for [Anthropic models](/api/classes/AnthropicTextGenerationModel).
- **Llama 2**: [mapChatPromptToLlama2Format()](/api/modules#mapchatprompttollama2format)
  for models that use the [Llama 2 prompt format](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- **Vicuna** [mapChatPromptToVicunaFormat()](/api/modules#mapchatprompttovicunaformat)
  for models that use the Vicuna prompt format.
- **Basic text**: [mapChatPromptToTextFormat()](/api/modules#mapchatprompttotextformat)
  for other models that expect a generic text prompt.

### Limiting the chat length

After a while, including all messages from a chat in the prompt can become infeasible, because the context window size is limited.

When you use chat prompts, you can limit the included messages with the [trimChatPrompt()](/api/modules#trimchatprompt) function.
It keeps only the most recent messages in the prompt, while leaving enough space for the completion.

It automatically uses the [context window size](/api/interfaces/TextGenerationModel#contextwindowsize), the [maximum number of completion tokens](/api/interfaces/TextGenerationModel#maxcompletiontokens) and the [tokenizer](/api/interfaces/TextGenerationModel#tokenizer) of the model to determine how many messages to keep. The system message is always included.

#### Example

```ts
const systemPrompt = `You are a helpful, respectful and honest assistant.`;
const messages: Array<{ user: string } | { ai: string }> = [
  // ...
];

const textStream = await streamText(
  model,
  await trimChatPrompt({
    prompt: [{ system: systemPrompt }, ...messages],
    model,
  })
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
- [Cohere](/integration/model-provider/cohere)
- [Llama.cpp](/integration/model-provider/llamacpp)
- [Hugging Face](/integration/model-provider/huggingface) (no streaming)
