---
sidebar_position: 10
---

# Mistral

Generate text and embeddings using the [Mistral platform](https://mistral.ai).

## Setup

1. Sign up for the [Mistral platform](https://console.mistral.ai/), activate your subscription and and generate an API key.
1. The API key can be configured as an environment variable (`MISTRAL_API_KEY`) or passed in as an option into the model constructor.

## Configuration

### API Configuration

[Mistral API Configuration](/api/classes/MistralApiConfiguration)

```ts
import { mistral } from "modelfusion";

const api = mistral.Api({
  apiKey: "my-api-key", // optional; default: process.env.MISTRAL_API_KEY
  // ...
});

const model = mistral.ChatTextGenerator({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/mistral)

### Generate Text

[MistralChatModel API](/api/classes/MistralChatModel)

```ts
import { generateText, mistral } from "modelfusion";

const text = await generateText(
  mistral.ChatTextGenerator({
    model: "mistral-medium",
    maxGenerationTokens: 120,
  }),
  [
    {
      role: "user",
      content: "Write a short story about a robot learning to love:",
    },
  ]
);
```

### Stream Text

[MistralChatModel API](/api/classes/MistralChatModel)

```ts
import { mistral, streamText } from "modelfusion";

const textStream = await streamText(
  mistral.ChatTextGenerator({
    model: "mistral-medium",
    maxGenerationTokens: 120,
  }),
  [
    {
      role: "user",
      content: "Write a short story about a robot learning to love:",
    },
  ]
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Embed Text

[MistralTextEmbeddingModel API](/api/classes/MistralTextEmbeddingModel)

```ts
import { embedMany, mistral } from "modelfusion";

const embeddings = await embedMany(
  mistral.TextEmbedder({ model: "mistral-embed" }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]
);
```

## Prompt Template

### Mistral Prompt Format

#### Text prompt

[MistralPrompt.text()](/api/namespaces/MistralPrompt) lets you use basic text prompts with Mistral text generation models. It is available as a shorthand method:

```ts
const textStream = await streamText(
  mistral
    .ChatTextGenerator({
      // ...
    })
    .withTextPrompt(),
  "Write a short story about a robot learning to love."
);
```

#### Instruction prompt

[MistralPrompt.instruction()](/api/namespaces/MistralPrompt) lets you use [text instruction prompts](/api/interfaces/TextInstructionPrompt) with Mistral text generation models. It is available as a shorthand method:

```ts
const textStream = await streamText(
  mistral
    .ChatTextGenerator({
      // ...
    })
    .withInstructionPrompt(),
  {
    system: "You are a celebrated poet.",
    instruction: "Write a short story about a robot learning to love.",
  }
);
```

#### Chat prompt

[MistralPrompt.chat()](/api/namespaces/MistralPrompt) lets you use [text chat prompts](/api/interfaces/TextChatPrompt) with Mistral text generation models. It is available as a shorthand method:

```ts
const textStream = await streamText(
  mistral
    .ChatTextGenerator({
      // ...
    })
    .withChatPrompt(),
  {
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
  }
);
```
