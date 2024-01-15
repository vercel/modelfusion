---
sidebar_position: 6
---

# Ollama

Generate text and embeddings using [Ollama](https://ollama.ai). You can run the Ollama server locally or remote.

## Setup

1. Install [Ollama](https://github.com/jmorganca/ollama) following the instructions in the `jmorganca/ollama` repository.
1. Pull the model you want to use, e.g. Llama 2.
   - [List of models](https://ollama.ai/library)
1. Start Ollama in server mode: `ollama serve`

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/ollama)

### Generate Text (Completion)

[Generate Text Docs](/guide/function/generate-text) | [OllamaCompletionModel API](/api/classes/OllamaCompletionModel)

The `OllamaCompletionModel` uses the Ollama completion API to generate text.

```ts
import { ollama, generateText } from "modelfusion";

const text = await generateText({
  model: ollama
    .CompletionTextGenerator({
      model: "mistral:text", // mistral base model without instruct fine-tuning (no prompt template)
      temperature: 0.7,
      maxGenerationTokens: 120,
    })
    .withTextPrompt(), // use text prompt style

  prompt: "Write a short story about a robot learning to love:\n\n",
});
```

When using the Ollama completion API, you can use the `raw` mode and set a prompt template on the model.
This enables you to use the `withChatPrompt`, `withInstructionPrompt` and `withTextPrompt` helpers.

```ts
import { generateText, ollama } from "modelfusion";

const text = await generateText({
  model: ollama
    .CompletionTextGenerator({
      model: "mistral",
      promptTemplate: ollama.prompt.Mistral,
      raw: true, // required when using custom prompt template
      maxGenerationTokens: 120,
    })
    .withTextPrompt(), // use text prompt style

  prompt: "Write a short story about a robot learning to love.",
});
```

### Generate Text (Chat)

[Generate Text Docs](/guide/function/generate-text) | [OllamaChatModel API](/api/classes/OllamaChatModel)

The `OllamaChatModel` uses the Ollama chat API to generate text.

```ts
import { ollama, generateText } from "modelfusion";

const text = await generateText({
  model: ollama
    .ChatTextGenerator({
      model: "llama2:chat",
      maxGenerationTokens: 500,
    })
    .withTextPrompt(),

  prompt: "Write a short story about a robot learning to love:",
});
```

The Ollama prompt also supports base64-encoded png and jpeg images, e.g. with an instruction prompt:

```ts
import { ollama, generateText } from "modelfusion";

const image = fs.readFileSync(path.join("data", "comic-mouse.png"), {
  encoding: "base64",
});

const text = await generateText({
  model: openai
    .ChatTextGenerator({
      model: "gpt-4-vision-preview",
      maxGenerationTokens: 1000,
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

### Stream Text (Completion)

[Stream Text Docs](/guide/function/generate-text#streamtext) | [OllamaCompletionModel API](/api/classes/OllamaCompletionModel)

```ts
import { ollama, streamText } from "modelfusion";

const textStream = await streamText({
  model: ollama
    .CompletionTextGenerator({
      model: "mistral",
      promptTemplate: ollama.prompt.Mistral,
      raw: true, // required when using custom prompt template
      maxGenerationTokens: 500,
    })
    .withTextPrompt(),

  prompt: "Write a short story about a robot learning to love:",
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Stream Text (Chat)

[Stream Text Docs](/guide/function/generate-text#streamtext) | [OllamaChatModel API](/api/classes/OllamaChatModel)

```ts
import { ollama, streamText } from "modelfusion";

const textStream = await streamText({
  model: ollama
    .ChatTextGenerator({
      model: "llama2:chat",
      maxGenerationTokens: 500,
    })
    .withTextPrompt(),

  prompt: "Write a short story about a robot learning to love:",
});
```

### Generate Structure (Chat)

[Generate Structure Docs](/guide/function/generate-structure)

Structure generation is possible with capable open-source models like [OpenHermes 2.5](https://ollama.ai/library/openhermes).

```ts
import { ollama, zodSchema, generateStructure } from "modelfusion";
import { z } from "zod";

const sentiment = await generateStructure({
  model: ollama
    .ChatTextGenerator({
      model: "openhermes2.5-mistral",
      maxGenerationTokens: 1024,
      temperature: 0,
    })
    .asStructureGenerationModel(jsonStructurePrompt.instruction()),

  schema: zodSchema(
    z.object({
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    })
  ),

  prompt: {
    system:
      "You are a sentiment evaluator. " +
      "Analyze the sentiment of the following product review:",
    instruction:
      "After I opened the package, I was met by a very unpleasant smell " +
      "that did not disappear even after washing. Never again!",
  },
});
```

### Stream Structure (Chat)

[Stream Structure Docs](/guide/function/generate-structure#streamstructure)

```ts
import {
  jsonStructurePrompt,
  ollama,
  streamStructure,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

const structureStream = await streamStructure({
  model: ollama
    .ChatTextGenerator({
      model: "openhermes2.5-mistral",
      maxGenerationTokens: 1024,
      temperature: 0,
    })
    .asStructureGenerationModel(jsonStructurePrompt.text()),

  schema: zodSchema(
    z.object({
      characters: z.array(
        z.object({
          name: z.string(),
          class: z
            .string()
            .describe("Character class, e.g. warrior, mage, or thief."),
          description: z.string(),
        })
      ),
    })
  ),

  prompt: "Generate 3 character descriptions for a fantasy role playing game. ",
});

for await (const partialStructure of structureStream) {
  console.clear();
  console.log(partialStructure);
}
```

### Embed Text

[Embed Value Docs](/guide/function/embed) | [OllamaTextEmbeddingModel API](/api/classes/OllamaTextEmbeddingModel)

```ts
import { embedMany, ollama } from "modelfusion";

const embeddings = await embedMany({
  model: ollama.TextEmbedder({ model: "llama2" }),
  values: [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ],
});
```

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

## Prompt Templates

Many models are trained on specific prompts.
You can use [prompt templates](/guide/function/generate-text#prompt-template) to use higher-level prompt templates such
as instruction and chat prompts and map them to the correct format for your model.
The prompt template that the model expected is usually described on the model card on HuggingFace.

Specific [prompt templates for Ollama CompletionTextGenerator](/api/namespaces/ollama.prompt) models are available under `ollama.prompt`:

| Prompt Template        | Ollama Prompt Template     | Text Prompt | Instruction Prompt | Chat Prompt |
| ---------------------- | -------------------------- | ----------- | ------------------ | ----------- |
| Alpaca                 | `ollama.prompt.Alpaca`     | ✅          | ✅                 | ❌          |
| ChatML                 | `ollama.prompt.ChatML`     | ✅          | ✅                 | ✅          |
| Llama 2                | `ollama.prompt.Llama2`     | ✅          | ✅                 | ✅          |
| Mistral Instruct       | `ollama.prompt.Mistral`    | ✅          | ✅                 | ✅          |
| NeuralChat             | `ollama.prompt.NeuralChat` | ✅          | ✅                 | ✅          |
| Synthia                | `ollama.prompt.Synthia`    | ✅          | ✅                 | ✅          |
| Vicuna                 | `ollama.prompt.Vicuna`     | ✅          | ✅                 | ✅          |
| Generic Text (default) | `ollama.prompt.Text`       | ✅          | ✅                 | ✅          |

## Links & Resources

- [Ollama website](https://ollama.ai)
- [Ollama GitHub](https://github.com/jmorganca/ollama)
- [Ollama model library](https://ollama.ai/library)
- [Next.js Chatbot starter for Ollama](https://github.com/lgrammel/modelfusion-ollama-nextjs-starter)
- [Blog Post: Create Your Own Local Chatbot with Next.js, Ollama, and ModelFusion](/blog/ollama-nextjs-chatbot)
