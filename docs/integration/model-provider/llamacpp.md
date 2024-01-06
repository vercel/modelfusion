---
sidebar_position: 5
---

# Llama.cpp

Generate text using [llama.cpp](https://github.com/ggerganov/llama.cpp). You can run the llama.cpp server locally or remote.

## Setup

1. Install [llama.cpp](https://github.com/ggerganov/llama.cpp) following the instructions in the `llama.cpp` repository.
1. Download the models that you want to use and try it out with llama.cpp.
   - [Search for GGUF models on Hugging Face](https://huggingface.co/models?sort=trending&search=gguf)
   - [Llama 2 7b Chat](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF)
   - [Llama 2 7b](https://huggingface.co/TheBloke/Llama-2-7B-GGUF)
1. Start the [llama.cpp server](https://github.com/ggerganov/llama.cpp/tree/master/examples/server) with the model that you want to serve:
   - e.g., `./server -m models/llama-2-7b-chat.GGUF.q4_0.bin` (Mac)
   - For generating embeddings, you need to start the server with the `--embedding` flag.
   - For multi-modal models, you need to specify the projection with the `--mmproj` flag.
   - [llama.cpp server docs](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)

### Llamafile support

[Llamafile](https://github.com/Mozilla-Ocho/llamafile) is a executable format for distributing LLMs.
The server llamafiles start a llama.cpp server with the model.
You can call it from ModelFusion in the same way as a regular llama.cpp server.

## Models

You can use various GGUF models with llama.cpp.

### Example Text Models

- [Search for GGUF models on Hugging Face](https://huggingface.co/models?sort=trending&search=gguf)
- [Mistral 7b](https://huggingface.co/TheBloke/Mistral-7B-v0.1-GGUF)
- [Llama 2 7b Chat](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF)
- [Llama 2 7b](https://huggingface.co/TheBloke/Llama-2-7B-GGUF)

Server start example: `./server -m models/llama-2-7b-chat.GGUF.q4_0.bin` (Mac)

## Example Multi-modal Models

For running multi-modal models, you need to specify the projection with the `--mmproj` flag.

- [BakLlava](https://huggingface.co/mys/ggml_bakllava-1/tree/main)
- [Llava](https://huggingface.co/mys/ggml_llava-v1.5-7b/tree/main)

Server start example: `./server -m models/bakllava/ggml-model-q4_k.gguf --mmproj models/bakllava/mmproj-model-f16.gguf` (Mac)

## Configuration

### API Configuration

[Llama.cpp API Configuration](/api/classes/LlamaCppApiConfiguration)

```ts
const api = llamacpp.Api({
  baseUrl: {
    host: "localhost",
    port: "9000",
  },
  // ...
});

const model = llamacpp.TextGenerator({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/llamacpp)

### Generate Text

[LlamaCppCompletionModel API](/api/classes/LlamaCppCompletionModel)

Consider [mapping the prompt to the prompt template](#prompt-formats) that your model was trained on.

```ts
import { llamacpp, generateText } from "modelfusion";

const text = await generateText(
  llamacpp
    .TextGenerator({
      maxGenerationTokens: 256,
    })
    .withTextPrompt(),
  "Write a short story about a robot learning to love:\n\n"
);
```

### Stream Text

[LlamaCppCompletionModel API](/api/classes/LlamaCppCompletionModel)

Consider [mapping the prompt to the prompt template](#prompt-formats) that your model was trained on.

```ts
import { llamacpp, streamText } from "modelfusion";

const textStream = await streamText(
  llamacpp
    .TextGenerator({
      maxGenerationTokens: 1024,
      temperature: 0.7,
    })
    .withTextPrompt(),
  "Write a short story about a robot learning to love:\n\n"
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Generate Structure

Structure generation is possible with capable open-source models like [OpenHermes 2.5](https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF). You need to use the `json` grammar for structure generation and use a `jsonStructurePrompt`.

```ts
import {
  ChatMLPrompt,
  generateStructure,
  jsonStructurePrompt,
  llamacpp,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

const structure = await generateStructure(
  llamacpp
    .TextGenerator({
      // run openhermes-2.5-mistral-7b.Q4_K_M.gguf in llama.cpp
      maxGenerationTokens: 1024,
      temperature: 0,
      grammar: llamacpp.grammar.json, // force JSON output
    })
    .withTextPromptTemplate(ChatMLPrompt.instruction()) // needed for jsonStructurePrompt.text()
    .asStructureGenerationModel(jsonStructurePrompt.text()),

  zodSchema(
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

  "Generate 3 character descriptions for a fantasy role playing game. "
);
```

### Stream Structure

Structure generation is possible with capable open-source models like [OpenHermes 2.5](https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF). LLama.cpp supports JSON array output as top-level structure with the `jsonArray` grammar.

```ts
import {
  ChatMLPrompt,
  jsonStructurePrompt,
  llamacpp,
  streamStructure,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

const structureStream = await streamStructure(
  llamacpp
    .TextGenerator({
      // run openhermes-2.5-mistral-7b.Q4_K_M.gguf in llama.cpp
      maxGenerationTokens: 1024,
      temperature: 0,
      grammar: llamacpp.grammar.jsonArray, // force JSON array output
    })
    .withTextPromptTemplate(ChatMLPrompt.instruction()) // needed for jsonStructurePrompt.text()
    .asStructureGenerationModel(jsonStructurePrompt.text()),

  zodSchema(
    // With grammar.jsonArray, it is possible to output arrays as top level structures:
    z.array(
      z.object({
        name: z.string(),
        class: z
          .string()
          .describe("Character class, e.g. warrior, mage, or thief."),
        description: z.string(),
      })
    )
  ),

  "Generate 3 character descriptions for a fantasy role playing game. "
);

for await (const part of structureStream) {
  if (part.isComplete) {
    const fullyTypedStructure = part.value;
    console.log("final value", fullyTypedStructure);
  } else {
    const unknownPartialStructure = part.value;
    console.log("partial value", unknownPartialStructure);
  }
}
```

### Text Embedding

[LlamaCppTextEmbeddingModel API](/api/classes/LlamaCppTextEmbeddingModel)

```ts
import { llamacpp, embedMany } from "modelfusion";

const embeddings = await embedMany(llamacpp.TextEmbedder(), [
  "At first, Nox didn't know what to do with the pup.",
  "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
]);
```

### Tokenize Text

[LlamaCppTokenizer API](/api/classes/LlamaCppTokenizer)

```ts
import { llamacpp, countTokens } from "modelfusion";

const tokenizer = llamacpp.Tokenizer();

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await countTokens(tokenizer, text);
const tokens = await tokenizer.tokenize(text);

console.log("countTokens", tokenCount);
console.log("tokenize", tokens);
```

### Context Window Size

You can serve models with different context window sizes with your Llama.cpp server.
By default, the `contextWindowSize` property on the `LlamaCppCompletionModel` is set to `undefined`.
However, some functions that automatically optimize the prompt size (e.g., recursive summarization) require a context window size on the model.
You can set the context window size on the model by passing it as a parameter to the constructor.

```ts
import { llamacpp } from "modelfusion";

const model = llamacpp.TextGenerator({
  // Assuming Llama2 7B model context window size of 4096 tokens.
  // Change to the context window size of the model you are using:
  contextWindowSize: 4096,
});
```

## Prompt Templates

Many models are trained on specific prompts.
You can use [prompt templates](#prompt-format) to use higher-level prompt templates such
as instruction and chat prompts and map them to the correct format for your model.
The prompt template that the model expected is usually described on the model card on HuggingFace.

### Llama 2 prompt template

Llama 2 uses a special prompt template (see "[How to prompt Llama 2 chat](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat)"):

#### Text prompt template

You can use [Llama2Prompt.text()](/api/namespaces/Llama2Prompt#text) to create basic text prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptTemplate(Llama2Prompt.text()),
  "Write a short story about a robot learning to love."
);
```

#### Instruction prompt template

You can use [Llama2Prompt.instruction()](/api/namespaces/Llama2Prompt#instruction) to create instruction prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptTemplate(Llama2Prompt.instruction()),
  {
    system: "You are a celebrated poet.",
    instruction: "Write a short story about a robot learning to love.",
  }
);
```

#### Chat prompt template

You can use [Llama2Prompt.chat()](/api/namespaces/Llama2Prompt#chat) to create chat prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptTemplate(Llama2Prompt.chat()),
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

### ChatML prompt template

ChatML is a prompt template that is used by several models, e.g. [OpenHermes-2.5-Mistral](https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF).

#### Text prompt template

You can use [ChatMLPrompt.text()](/api/namespaces/ChatMLPrompt#text) to create basic text prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptTemplate(ChatMLPrompt.text()),
  "Write a short story about a robot learning to love."
);
```

#### Instruction prompt template

You can use [ChatMLPrompt.instruction()](/api/namespaces/ChatMLPrompt#instruction) to create instruction prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptTemplate(ChatMLPrompt.instruction()),
  {
    instruction: "Write a short story about a robot learning to love.",
  }
);
```

#### Chat prompt template

You can use [ChatMLPrompt.chat()](/api/namespaces/ChatMLPrompt#chat) to create chat prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptTemplate(ChatMLPrompt.chat()),
  {
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

### Alpaca prompt template

Alpaca and several other models use the [Alpaca prompt template](https://github.com/tatsu-lab/stanford_alpaca#data-release):

#### text prompt template

You can use [AlpacaPrompt.text()](/api/namespaces/AlpacaPrompt#text) to create basic text prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptTemplate(AlpacaPrompt.text()),
  "Write a short story about a robot learning to love."
);
```

#### instruction prompt template

You can use [AlpacaPrompt.instruction()](/api/namespaces/AlpacaPrompt#instruction) to create instruction prompts.

:::note
Setting the system property overrides the Alpaca system prompt and can impact the model responses.
:::

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptTemplate(AlpacaPrompt.instruction()),
  {
    instruction: "You are a celebrated poet. Write a short story about:",
    input: "a robot learning to love.", // Alpaca supports optional input field
  }
);
```

### Vicuna prompt template

Vicuna and several other models use the Vicuna prompt template.

#### Chat prompt template

You can use [VicunaPrompt.chat()](/api/namespaces/VicunaPrompt#chat) to create chat prompts.

:::note
Setting the system property overrides the Vicuna system prompt and can impact the model responses.
:::

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptTemplate(VicunaPrompt.chat()),
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
