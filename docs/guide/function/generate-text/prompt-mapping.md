---
sidebar_position: 5
---

# Prompt Mapping

[Prompt mappings](/api/interfaces/PromptMapping) change the prompt format that a model accepts.
This enables the use of abstracted prompts such as [instruction](/api/modules#instructionprompt) or [chat](/api/modules#chatprompt) prompts.

You can map the prompt of a [TextGenerationModel](/api/interfaces/TextGenerationModel) using the `mapPrompt()` method.

## Instruction Prompts

[Instruction prompts](/api/modules#instructionprompt) are a higher level prompt format that contains an instruction and an optional system message.

### Example

```ts
const model = new CohereTextGenerationModel({
  // ...
}).mapPrompt(InstructionToTextPromptMapping());
```

The [InstructionToTextPromptMapping](/api/modules#instructiontotextpromptmapping) maps the instruction prompt to a text prompt (that is expected by the [CohereTextGenerationModel](/api/classes/CohereTextGenerationModel)).

You can now generate text using an instruction prompt:

```ts
const text = await generateText(model, {
  system: "You are a celebrated poet.",
  instruction: "Write a short story about a robot.",
});
```

### Prompt Mappings

The following built-in mappings are available for instruction prompts:

- [InstructionToTextPromptMapping](/api/modules#instructiontotextpromptmapping)
  Use this mapping if the model expects a text prompt.
- [InstructionToOpenAIChatPromptMapping](/api/modules#instructiontoopenaichatpromptmapping)
  Use this mapping for [OpenAI chat models](/api/classes/OpenAIChatModel).
- [InstructionToLlama2PromptMapping](/api/modules#instructiontollama2promptmapping)
  Use this mapping for Llama 2 models that expect a [special prompt format](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).

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
const textStream = await streamText(model, [
  { system: "You are a celebrated poet." },
  { user: "Write a short story about a robot learning to love." },
  { ai: "Once upon a time, there was a robot who learned to love." },
  { user: "That's a great start!" },
]);
```

### Prompt Mappings

The following built-in mappings are available for chat prompts:

- [ChatToTextPromptMapping](/api/modules#chattotextpromptmapping)
  Use this mapping if the model expects a text prompt.
- [ChatToOpenAIChatPromptMapping](/api/modules#chattoopenaichatpromptmapping)
  Use this mapping for [OpenAI chat models](/api/classes/OpenAIChatModel).
- [ChatToLlama2PromptMapping](/api/modules#chattollama2promptmapping)
  Use this mapping for Llama 2 models that expect a [special prompt format](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat).
