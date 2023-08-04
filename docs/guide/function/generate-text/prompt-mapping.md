---
sidebar_position: 5
---

# Prompt Mapping

[Prompt mappings](/api/interfaces/PromptMapping) change the prompt format that a model accepts.
This enables the use of abstracted prompts such as [instruction](/api/modules#instructionprompt) or [chat](/api/modules#chatprompt) prompts.

You can map the prompt of a [TextGenerationModel](/api/interfaces/TextGenerationModel) using the `mapPrompt()` method.

## Instruction Prompts

[Instruction prompts](/api/modules#instructionprompt) are a higher-level prompt format that contains an instruction, an optional input, and an optional system message. For some models, changing the system message can affect the results, so consider how your model works before setting it.

### Example

```ts
const model = new CohereTextGenerationModel({
  // ...
}).mapPrompt(InstructionToTextPromptMapping());
```

The [InstructionToTextPromptMapping](/api/modules#instructiontotextpromptmapping) maps the instruction prompt to a text prompt (that is expected by the [CohereTextGenerationModel](/api/classes/CohereTextGenerationModel)).

You can now generate text using an instruction prompt:

```ts
const { text } = await generateText(model, {
  system: "You are a celebrated poet.", // optional
  instruction: "Write a short story about:",
  input: "a robot learning to love", // optional
});
```

### Prompt Mappings

The following prompt mappings are available for instruction prompts:

- [InstructionToOpenAIChatPromptMapping](/api/modules#instructiontoopenaichatpromptmapping)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- [InstructionToLlama2PromptMapping](/api/modules#instructiontollama2promptmapping)
  for models that use the [Llama 2 prompt format](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- [InstructionToAlpacaPromptMapping](/api/modules#instructiontoopenaichatpromptmapping)
  for models that use the [Alpaca prompt format](https://github.com/tatsu-lab/stanford_alpaca#data-release).
- [InstructionToTextPromptMapping](/api/modules#instructiontotextpromptmapping)
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
}).mapPrompt(ChatToOpenAIChatPromptMapping());
```

The [ChatToOpenAIChatPromptMapping](/api/modules#chattoopenaichatpromptmapping) maps the chat prompt to an OpenAI chat prompt (that is expected by the [OpenAIChatModel](/api/classes/OpenAIChatModel)).

You can now generate text using a chat prompt:

```ts
const { textStream } = await streamText(model, [
  { system: "You are a celebrated poet." },
  { user: "Write a short story about a robot learning to love." },
  { ai: "Once upon a time, there was a robot who learned to love." },
  { user: "That's a great start!" },
]);
```

### Prompt Mappings

The following prompt mappings are available for chat prompts:

- [ChatToOpenAIChatPromptMapping](/api/modules#chattoopenaichatpromptmapping)
  for [OpenAI chat models](/api/classes/OpenAIChatModel).
- [ChatToLlama2PromptMapping](/api/modules#chattollama2promptmapping)
  for models that use the [Llama 2 prompt format](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
- [ChatToTextPromptMapping](/api/modules#chattotextpromptmapping)
  for other models that expect a generic text prompt.

## Custom Prompts

You can also create your own custom prompt formats and prompt mappings.

For this, you need to:

1. create an interface/type for your prompt format, and
2. create prompt mappings that map your prompt format to the prompt formats of the models that you want to use.

The interface for [prompt mapping](/api/interfaces/PromptMapping) consists of a map function
and a list of stop tokens.

```ts
interface PromptMapping<SOURCE_PROMPT, TARGET_PROMPT> {
  map(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;
  stopTokens: string[];
}
```

When you have a prompt mapping that matches the prompt format of a model, you can apply it as follows:

```ts
const modelWithMyCustomPromptFormat = model.mapPrompt(myPromptMapping);
```
