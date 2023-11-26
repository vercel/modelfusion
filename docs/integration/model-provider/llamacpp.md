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
   - e.g., `./server -m models/llama-2-7b-chat.GGUF.q4_0.bin -c 4096` (Mac)
   - For generating embeddings, you need to start the server with the `--embedding` flag.
   - For multi-modal models, you need to specify the projection with the `--mmproj` flag.
   - [llama.cpp server docs](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)

## Models

You can use various GGUF models with llama.cpp.

### Example Text Models

- [Search for GGUF models on Hugging Face](https://huggingface.co/models?sort=trending&search=gguf)
- [Mistral 7b](https://huggingface.co/TheBloke/Mistral-7B-v0.1-GGUF)
- [Llama 2 7b Chat](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF)
- [Llama 2 7b](https://huggingface.co/TheBloke/Llama-2-7B-GGUF)

Server start example: `./server -m models/llama-2-7b-chat.GGUF.q4_0.bin -c 4096` (Mac)

## Example Multi-modal Models

For running multi-modal models, you need to specify the projection with the `--mmproj` flag.

- [BakLlava](https://huggingface.co/mys/ggml_bakllava-1/tree/main)
- [Llava](https://huggingface.co/mys/ggml_llava-v1.5-7b/tree/main)

Server start example: `./server -m models/bakllava/ggml-model-q4_k.gguf --mmproj models/bakllava/mmproj-model-f16.gguf` (Mac)

## Configuration

### API Configuration

[Llama.cpp API Configuration](/api/classes/LlamaCppApiConfiguration)

```ts
const api = new LlamaCppApiConfiguration({
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

[LlamaCppTextGenerationModel API](/api/classes/LlamaCppTextGenerationModel)

Consider [mapping the prompt to the prompt format](#prompt-formats) that your model was trained on.

```ts
import { llamacpp, generateText } from "modelfusion";

const text = await generateText(
  llamacpp
    .TextGenerator({
      maxCompletionTokens: 256,
    })
    .withTextPrompt(),
  "Write a short story about a robot learning to love:\n\n"
);
```

### Stream Text

[LlamaCppTextGenerationModel API](/api/classes/LlamaCppTextGenerationModel)

Consider [mapping the prompt to the prompt format](#prompt-formats) that your model was trained on.

```ts
import { llamacpp, streamText } from "modelfusion";

const textStream = await streamText(
  llamacpp
    .TextGenerator({
      maxCompletionTokens: 1024,
      temperature: 0.7,
    })
    .withTextPrompt(),
  "Write a short story about a robot learning to love:\n\n"
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
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
By default, the `contextWindowSize` property on the `LlamaCppTextGenerationModel` is set to `undefined`.
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

## Prompt Formats

Many models are trained on specific prompts.
You can use [prompt formats](#prompt-format) to use higher-level prompt formats such
as instruction and chat prompts and map them to the correct format for your model.
The prompt format that the model expected is usually described on the model card on HuggingFace.

### Llama 2 prompt format

Llama 2 uses a special prompt format (see "[How to prompt Llama 2 chat](https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat)"):

#### Text prompt format

You can use [Llama2PromptFormat.text()](/api/namespaces/Llama2PromptFormat#text) to create basic text prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptFormat(Llama2PromptFormat.text()),
  "Write a short story about a robot learning to love."
);
```

#### Instruction prompt format

You can use [Llama2PromptFormat.instruction()](/api/namespaces/Llama2PromptFormat#instruction) to create instruction prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptFormat(Llama2PromptFormat.instruction()),
  {
    system: "You are a celebrated poet.",
    instruction: "Write a short story about a robot learning to love.",
  }
);
```

#### Chat prompt format

You can use [Llama2PromptFormat.chat()](/api/namespaces/Llama2PromptFormat#chat) to create chat prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptFormat(Llama2PromptFormat.chat()),
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

### ChatML prompt format

ChatML is a prompt format that is used by several models, e.g. [OpenHermes-2.5-Mistral](https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF).

#### Text prompt format

You can use [ChatMLPromptFormat.text()](/api/namespaces/ChatMLPromptFormat#text) to create basic text prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptFormat(ChatMLPromptFormat.text()),
  "Write a short story about a robot learning to love."
);
```

#### Instruction prompt format

You can use [ChatMLPromptFormat.instruction()](/api/namespaces/ChatMLPromptFormat#instruction) to create instruction prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptFormat(ChatMLPromptFormat.instruction()),
  {
    instruction: "Write a short story about a robot learning to love.",
  }
);
```

#### Chat prompt format

You can use [ChatMLPromptFormat.chat()](/api/namespaces/ChatMLPromptFormat#chat) to create chat prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptFormat(ChatMLPromptFormat.chat()),
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

### Alpaca prompt format

Alpaca and several other models use the [Alpaca prompt format](https://github.com/tatsu-lab/stanford_alpaca#data-release):

#### text prompt format

You can use [AlpacaPromptFormat.text()](/api/namespaces/AlpacaPromptFormat#text) to create basic text prompts.

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptFormat(AlpacaPromptFormat.text()),
  "Write a short story about a robot learning to love."
);
```

#### instruction prompt format

You can use [AlpacaPromptFormat.instruction()](/api/namespaces/AlpacaPromptFormat#instruction) to create instruction prompts.

:::note
Setting the system property overrides the Alpaca system prompt and can impact the model responses.
:::

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptFormat(AlpacaPromptFormat.instruction()),
  {
    instruction: "You are a celebrated poet. Write a short story about:",
    input: "a robot learning to love.", // Alpaca supports optional input field
  }
);
```

### Vicuna prompt format

Vicuna and several other models use the Vicuna prompt format.

#### Chat prompt format

You can use [VicunaPromptFormat.chat()](/api/namespaces/VicunaPromptFormat#chat) to create chat prompts.

:::note
Setting the system property overrides the Vicuna system prompt and can impact the model responses.
:::

```ts
const textStream = await streamText(
  llamacpp
    .TextGenerator({
      // ...
    })
    .withTextPromptFormat(VicunaPromptFormat.chat()),
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
