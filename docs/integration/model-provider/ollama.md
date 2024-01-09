---
sidebar_position: 6
---

# Ollama

Generate text and embeddings using [Ollama](https://github.com/jmorganca/ollama). You can run the Ollama server locally or remote.

## Setup

1. Install [Ollama](https://github.com/jmorganca/ollama) following the instructions in the `jmorganca/ollama` repository.
1. Pull the model you want to use, e.g. Llama 2.
   - [List of models](https://ollama.ai/library)
1. Start Ollama in server mode: `ollama serve`

## Configuration

### API Configuration

[Ollama API Configuration](/api/classes/OllamaApiConfiguration)

```ts
const api = ollama.Api({
  baseUrl: {
    port: "12345",
  },
  // ...
});

const model = ollama.CompletionTextGenerator({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/ollama)

### Generate Text (Completion)

[OllamaCompletionModel API](/api/classes/OllamaCompletionModel)

The `OllamaCompletionModel` uses the Ollama completion API to generate text.

```ts
import { ollama, generateText } from "modelfusion";

const text = await generateText(
  ollama.CompletionTextGenerator({
    model: "mistral:text", // mistral base model without instruct fine-tuning
    temperature: 0.7,
    maxGenerationTokens: 120,
  }),
  { prompt: "Write a short story about a robot learning to love:\n\n" }
);
```

When using the Ollama completion API, you can use the `raw` mode and set a prompt template on the model.
This enables you to use the `withChatPrompt`, `withInstructionPrompt` and `withTextPrompt` helpers.

```ts
import { generateText, ollama } from "modelfusion";

const text = await generateText(
  ollama
    .CompletionTextGenerator({
      model: "mistral",
      promptTemplate: ollama.prompt.Mistral,
      raw: true, // required when using custom prompt template
      maxGenerationTokens: 120,
    })
    .withTextPrompt(),

  "Write a short story about a robot learning to love."
);
```

### Generate Text (Chat)

[OllamaChatModel API](/api/classes/OllamaChatModel)

The `OllamaChatModel` uses the Ollama chat API to generate text.

```ts
import { ollama, generateText } from "modelfusion";

const text = await generateText(
  ollama.ChatTextGenerator({
    model: "llama2:chat",
    maxGenerationTokens: 500,
  }),
  [
    {
      role: "user",
      content: "Write a short story about a robot learning to love:",
    },
  ]
);
```

The Ollama prompt also supports base64-encoded png and jpeg images, e.g. with an instruction prompt:

```ts
import { ollama, generateText } from "modelfusion";

const image = fs.readFileSync(path.join("data", "comic-mouse.png"), {
  encoding: "base64",
});

const text = await generateText(
  openai
    .ChatTextGenerator({
      model: "gpt-4-vision-preview",
      maxGenerationTokens: 1000,
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

You can use [prompt templates](/guide/function/generate-text#prompt-template), e.g. using the `.withTextPrompt()` helper:

```ts
import { ollama, generateText } from "modelfusion";

const text = await generateText(
  ollama
    .ChatTextGenerator({
      model: "llama2:chat",
      maxGenerationTokens: 500,
    })
    .withTextPrompt(),

  "Write a short story about a robot learning to love:"
);
```

### Stream Text (Completion)

[OllamaCompletionModel API](/api/classes/OllamaCompletionModel)

```ts
import { ollama, streamText } from "modelfusion";

const textStream = await streamText(
  ollama
    .CompletionTextGenerator({
      model: "mistral",
      promptTemplate: ollama.prompt.Mistral,
      raw: true, // required when using custom prompt template
      maxGenerationTokens: 500,
    })
    .withTextPrompt(),

  "Write a short story about a robot learning to love:\n\n"
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Stream Text (Chat)

[OllamaChatModel API](/api/classes/OllamaChatModel)

```ts
import { ollama, streamText } from "modelfusion";

const textStream = await streamText(
  ollama.ChatTextGenerator({
    model: "llama2:chat",
    maxGenerationTokens: 500,
  }),
  [
    {
      role: "user",
      content: "Write a short story about a robot learning to love:",
    },
  ]
);
```

### Generate Structure (Chat)

Structure generation is possible with capable open-source models like [OpenHermes 2.5](https://ollama.ai/library/openhermes).

```ts
import { ollama, zodSchema, generateStructure } from "modelfusion";
import { z } from "zod";

const model = ollama
  .ChatTextGenerator({
    model: "openhermes2.5-mistral",
    maxGenerationTokens: 1024,
    temperature: 0,
  })
  .asStructureGenerationModel(jsonStructurePrompt.text());

const sentiment = await generateStructure(
  model,
  zodSchema(
    z.object({
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    })
  ),
  {
    system:
      "You are a sentiment evaluator. " +
      "Analyze the sentiment of the following product review:",
    instruction:
      "After I opened the package, I was met by a very unpleasant smell " +
      "that did not disappear even after washing. Never again!",
  }
);
```

### Embed Text

[OllamaTextEmbeddingModel API](/api/classes/OllamaTextEmbeddingModel)

```ts
import { embedMany, ollama } from "modelfusion";

const embeddings = await embedMany(ollama.TextEmbedder({ model: "llama2" }), [
  "At first, Nox didn't know what to do with the pup.",
  "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
]);
```
