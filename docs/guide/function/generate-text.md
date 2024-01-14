---
sidebar_position: 10
---

# Generate Text

Generates text using a [TextGenerationModel](/api/interfaces/TextGenerationModel) and a prompt.
You can also stream the text if it is supported by the model.

Your text generation prompt needs to match the model prompt style. The raw prompt style of each model is exposed by default. For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of OpenAI chat messages. You can use other [prompt styles](#prompt-styles) by calling `.withTextPrompt()`, `.withInstructionPrompt()`, `.withChatPrompt()`, or `.withPromptTemplate()` on the model.

## Usage

### TextGenerationModel

The different [TextGenerationModel](/api/interfaces/TextGenerationModel) implementations (see [available providers](#available-providers)) share common settings:

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

You can generate text and get a single completion string response by using the `generateText` function. `generateText` takes a [TextGenerationModel](/api/interfaces/TextGenerationModel), a prompt that matches the format accepted by the model, and optional options as arguments.

#### Example: OpenAI text model

```ts
import { generateText, openai } from "modelfusion";

const text = await generateText({
  model: openai.CompletionTextGenerator(/* ... */),
  prompt: "Write a short story about a robot learning to love:\n\n",
});
```

#### Example: OpenAI chat model

```ts
import { generateText, openai } from "modelfusion";

const text = await generateText({
  model: openai.ChatTextGenerator(/* ... */),
  prompt: [
    openai.ChatMessage.system(
      "Write a short story about a robot learning to love:"
    ),
  ],
});
```

#### Example: OpenAI chat model with multi-modal input

Multi-modal vision models such as GPT 4 Vision can process images as part of the prompt.

```ts
import { generateText, openai } from "modelfusion";

const text = await generateText({
  model: openai.ChatTextGenerator({ model: "gpt-4-vision-preview" }),
  prompt: [
    openai.ChatMessage.user([
      { type: "text", text: "Describe the image in detail:" },
      { type: "image", base64Image: image, mimeType: "image/png" },
    ]),
  ],
});
```

When you set the `fullResponse` option to `true`, you get get a rich response object with the following properties:

- **text**: The generated of the first result.
- **finishReason**: The finish reason of the first result. It can be `stop` (the model stopped because it generated a stop sequence), `length` (the model stopped because it generated the maximum number of tokens), `content-filter` (the model stopped because the content filter detected a violation), `tool-calls` (the model stopped because it triggered a tool call), `error` (the model stopped because of an error), `other` (the model stopped for another reason), or `unknown` (the model stop reason is not know or the model does not support finish reasons).
- **texts**: The generated texts of all results. Useful when you set `numberOfGenerations` to a value greater than 1.
- **textGenerationResults**: The generated text generation results of all results and their finish reasons. Useful when you set `numberOfGenerations` to a value greater than 1.
- **response**: The raw response of the model.
- **metadata**: The metadata for model call.

#### Example: Generate multiple completions

```ts
import { generateText, openai } from "modelfusion";

const { texts } = await generateText({
  model: openai.CompletionTextGenerator({
    model: "gpt-3.5-turbo-instruct",
    numberOfGenerations: 2,
  }),
  prompt: "Write a short story about a robot learning to love:",
  fullResponse: true,
});
```

#### Example: Accessing the finish reason

```ts
import { generateText, openai } from "modelfusion";

const { text, finishReason } = await generateText({
  model: openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),
  prompt: "Write a short story about a robot learning to love:",
  fullResponse: true,
});
```

### streamText

[streamText API](/api/modules#streamtext)

You can use most text generation models in streaming mode. Just use the `streamText` function instead of `generateText`.

#### Example: OpenAI chat model

```ts
import { streamText, openai } from "modelfusion";

const textStream = await streamText({
  model: openai.ChatTextGenerator(/* ... */),
  prompt: [
    openai.ChatMessage.system("You are a story writer. Write a story about:"),
    openai.ChatMessage.user("A robot learning to love"),
  ],
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

When you set the `fullResponse` option to `true`, you get get a rich response object with the following properties:

- **textStream**: The generated text stream of the first result.
- **text**: The generated of the first result. It's a promise that resolves when the stream is finished.
- **metadata**: The metadata for model call.

#### Example: Full response

```ts
import { streamText, openai } from "modelfusion";

const { textStream, text, metadata } = await streamText({
  model: openai.CompletionTextGenerator(/* ... */),
  prompt: "Write a story about a robot learning to love",
  fullResponse: true,
});
```

## Prompt Styles

ModelFusion supports different prompt styles for text generation and streaming models. You can use this to abstract away the details of the prompt format that a model expects and create reusable prompts.

There a 5 different prompt styles in ModelFusion:

- **raw prompt**: The raw prompt style of a model. It varies from model to model, and is the style that the model expects.
- **text prompt**: A simple string prompt.
- **instruction prompt**: Contains an instruction, an optional system message, and an optional response prefix.
- **chat prompt**: Contains a combination of a system message and a list of user, assistant, and tool messages.
- **custom prompt**: You can create your own custom prompt styles.

### Raw Prompt

By default, each model exposes its raw prompt style. For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of OpenAI chat messages.

### Text Prompt

Text prompts are a simple string prompts. They are useful for mapping a simple prompt into the specific prompt template that a model expects. You can call the `.withTextPrompt()` method on a model to map the prompt to a text prompt.

#### Example: OpenAIChatPrompt

```ts
const model = openai
  .ChatTextGenerator({
    // ...
  })
  .withTextPrompt();
```

You can now generate text using a basic text prompt:

```ts
const text = await generateText({
  model,
  prompt: "Write a story about a robot learning to love",
});
```

### Instruction Prompt

[Instruction prompts](/api/interfaces/InstructionPrompt) are a higher-level prompt templates that contain an instruction, an optional system message, and an optional response prefix (not supported by all models, in particular chat models). They can contain multi-modal content (if supported by the model).

#### Example: Mistral chat model

```ts
const text = await generateText({
  model: mistral
    .ChatTextGenerator({
      // ...
    })
    .withInstructionPrompt(),

  prompt: {
    system: "You are a celebrated poet.", // optional
    instruction: "Write a story about a robot learning to love",
  },
});
```

#### Example: OpenAIChatModel multi-modal input

Multi-modal vision models such as GPT 4 Vision support multi-modal prompts:

```ts
const textStream = await streamText({
  model: openai
    .ChatTextGenerator({
      model: "gpt-4-vision-preview",
    })
    .withInstructionPrompt(),

  prompt: {
    instruction: [
      { type: "text", text: "Describe the image in detail:\n\n" },
      { type: "image", base64Image: image, mimeType: "image/png" },
    ],
  },
});
```

#### Example: Llama.cpp completion model with response prefix

Completion models (that use a simple text completion API behind the scenes) support response prefixes. You can use the response prefix to further guide the model. For example, you can provide a code snippet and ask the model to complete it, starting a markdown blog with the language of the code snippet.

````ts
const textStream = await streamText({
  model: llamacpp
    .CompletionTextGenerator({
      // run dolphin-2.7-mixtral-8x7b.Q4_K_M.gguf with llama.cpp
      // https://huggingface.co/TheBloke/dolphin-2.7-mixtral-8x7b-GGUF
      promptTemplate: llamacpp.prompt.ChatML,
      maxGenerationTokens: 2048,
      temperature: 0,
      stopSequences: ["\n```"],
    })
    .withInstructionPrompt(),

  prompt: {
    system: dolphinSystemPrompt, // see https://erichartford.com/dolphin-25-mixtral-8x7b
    instruction:
      "Write a React page with React hooks for a simple calculator app. " +
      "It should support addition, subtraction, multiplication, and division.",
    responsePrefix: "Here is the program:\n```typescript\n",
  },
});
````

### Chat Prompt

[Chat prompts](/api/interfaces/ChatPrompt) are a higher-level prompts that
consist of a combination of a system message and a list of user, assistant, and tool messages.

The user messages can contain multi-modal content. The assistant messages can contain tool calls.

:::note
Not all models and prompt formats support multi-modal inputs and tool calls.
:::

#### Example: openai.ChatTextGenerator

You can now generate text using a chat prompt:

```ts
const textStream = await streamText({
  model: openai
    .ChatTextGenerator({
      model: "gpt-3.5-turbo",
    })
    .withChatPrompt(),

  prompt: {
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
  },
});
```

#### Limiting the chat length

After a while, including all messages from a chat in the prompt can become infeasible, because the context window size is limited.

When you use chat prompts, you can limit the included messages with the [trimChatPrompt()](/api/modules#trimchatprompt) function.
It keeps only the most recent messages in the prompt, while leaving enough space for the completion.

It automatically uses the [context window size](/api/interfaces/TextGenerationModel#contextwindowsize), the [maximum number of completion tokens](/api/interfaces/TextGenerationModel#maxGenerationTokens) and the [tokenizer](/api/interfaces/TextGenerationModel#tokenizer) of the model to determine how many messages to keep. The system message is always included.

#### Example

```ts
const chat: ChatPrompt = {
  system: `You are a helpful, respectful and honest assistant.`,
  messages: [
    //...
  ],
};

const textStream = await streamText({
  model,
  prompt: await trimChatPrompt({ prompt: chat, model }),
});
```

### Custom Prompt

You can also create your own custom prompt templates and prompt templates.

You can map the prompt of a [TextGenerationModel](/api/interfaces/TextGenerationModel) using the `withPromptTemplate()` method to a custom prompt style.

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
