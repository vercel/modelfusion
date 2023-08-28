---
sidebar_position: 5
---

# Prompt Format

[Prompt formats](/api/interfaces/PromptFormat) change the prompt format that a model accepts.
This enables the use of abstracted prompts such as [instruction](/api/modules#instructionprompt) or [chat](/api/modules#chatprompt) prompts.

You can map the prompt of a [TextGenerationModel](/api/interfaces/TextGenerationModel) using the `withPromptFormat()` method.

## Instruction Prompts

[Instruction prompts](/api/modules#instructionprompt) are a higher-level prompt format that contains an instruction, an optional input, and an optional system message. For some models, changing the system message can affect the results, so consider how your model works before setting it.

### Example

```ts
const model = new CohereTextGenerationModel({
  // ...
}).withPromptFormat(TextInstructionPromptFormat());
```

The [TextInstructionPromptFormat](/api/modules#textinstructionpromptformat) maps the instruction prompt to a text prompt (that is expected by the [CohereTextGenerationModel](/api/classes/CohereTextGenerationModel)).

You can now generate text using an instruction prompt:

```ts
const text = await generateText(model, {
  system: "You are a celebrated poet.", // optional
  instruction: "Write a short story about:",
  input: "a robot learning to love", // optional
});
```

### Prompt Formats

The following prompt formats are available for instruction prompts:

- [OpenAIChatInstructionPromptFormat](/api/modules#openaichatinstructionpromptformat)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- [Llama2InstructionPromptFormat](/api/modules#llama2instructionpromptformat)
  for models that use the [Llama 2 prompt format](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- [AlpacaInstructionPromptFormat](/api/modules#alpacainstructionpromptformat)
  for models that use the [Alpaca prompt format](https://github.com/tatsu-lab/stanford_alpaca#data-release).
- [TextInstructionPromptFormat](/api/modules#textinstructionpromptformat)
  for other models that expect a generic text prompt.

## Chat Prompts

[Chat prompts](/api/modules#chatprompt) are a higher-level prompt format that contains a list of chat messages.

Chat prompts are an array with several constraints that are checked at runtime:

- A chat prompt can optionally start with a system message.
- After the optional system message, the first message of the chat must be a user message.
- Then it must be alternating between an ai message and a user message.
- The last message must always be a user message.

### Example

```ts
const model = new OpenAIChatModel({
  model: "gpt-3.5-turbo",
}).withPromptFormat(OpenAIChatChatPromptFormat());
```

The [OpenAIChatChatPromptFormat](/api/modules#openaichatcahtpromptformat) maps the chat prompt to an OpenAI chat prompt (that is expected by the [OpenAIChatModel](/api/classes/OpenAIChatModel)).

You can now generate text using a chat prompt:

```ts
const textStream = await streamText(model, [
  { system: "You are a celebrated poet." },
  { user: "Write a short story about a robot learning to love." },
  { ai: "Once upon a time, there was a robot who learned to love." },
  { user: "That's a great start!" },
]);
```

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

### Prompt Formats

The following prompt formats are available for chat prompts:

- [OpenAIChatChatPromptFormat](/api/modules#openaichatchatpromptformat)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- [Llama2ChatPromptFormat](/api/modules#llama2chatpromptformat)
  for models that use the [Llama 2 prompt format](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- [VicunaChatPromptFormat](/api/modules#vicunachatpromptformat)
  for models that use the Vicuna prompt format.
- [TextChatPromptFormat](/api/modules#textchatpromptformat)
  for other models that expect a generic text prompt.

## Custom Prompt Formats

You can also create your own custom prompt formats and prompt formats.

For this, you need to:

1. create an interface/type for your prompt format, and
2. create prompt formats that map your prompt format to the prompt formats of the models that you want to use.

The interface for [prompt format](/api/interfaces/PromptFormat) consists of a map function
and a list of stop tokens.

```ts
interface PromptFormat<SOURCE_PROMPT, TARGET_PROMPT> {
  map(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;
  stopSequences: string[];
}
```

When you have a prompt format that matches the prompt format of a model, you can apply it as follows:

```ts
const modelWithMyCustomPromptFormat = model.withPromptFormat(myPromptFormat);
```
