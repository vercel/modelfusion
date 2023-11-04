---
sidebar_position: 3
---

# Llama.cpp

Generate text using [llama.cpp](https://github.com/ggerganov/llama.cpp). You can run the llama.cpp server locally or remote.

## Setup

1. Install [llama.cpp](https://github.com/ggerganov/llama.cpp) following the instructions in the `llama.cpp` repository.
1. Download the models that you want to use and try it out with llama.cpp.
   - [Search for GGUF models on Hugging Face](https://huggingface.co/models?sort=trending&search=gguf)
     [Mistral 7b][https://huggingface.co/TheBloke/Mistral-7B-v0.1-GGUF]
   - [Llama 2 7b Chat](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGML)
   - [Llama 2 7b](https://huggingface.co/TheBloke/Llama-2-7B-GGML)
1. Start the llama.cpp server with the model that you want to serve:
   - e.g., `./server -m models/llama-2-7b-chat.GGUF.q4_0.bin -c 4096` (Mac)
   - For generating embeddings, you need to start the server with the `--embedding` flag.
   - [llama.cpp server docs](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)

## Configuration

### API Configuration

[Llama.cpp API Configuration](/api/classes/LlamaCppApiConfiguration)

```ts
const api = new LlamaCppApiConfiguration({
  // ...
});

const model = new LlamaCppTextGenerationModel({
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
import { LlamaCppTextGenerationModel, generateText } from "modelfusion";

const text = await generateText(
  new LlamaCppTextGenerationModel({ maxCompletionTokens: 256 }),
  "Write a short story about a robot learning to love:\n\n"
);
```

### Stream Text

[LlamaCppTextGenerationModel API](/api/classes/LlamaCppTextGenerationModel)

Consider [mapping the prompt to the prompt format](#prompt-formats) that your model was trained on.

```ts
import { LlamaCppTextGenerationModel, streamText } from "modelfusion";

const textStream = await streamText(
  new LlamaCppTextGenerationModel({
    maxCompletionTokens: 1024,
    temperature: 0.7,
  }),
  "Write a short story about a robot learning to love:\n\n"
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Text Embedding

[LlamaCppTextEmbeddingModel API](/api/classes/LlamaCppTextEmbeddingModel)

```ts
import { LlamaCppTextEmbeddingModel, embedMany } from "modelfusion";

const embeddings = await embedMany(new LlamaCppTextEmbeddingModel(), [
  "At first, Nox didn't know what to do with the pup.",
  "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
]);
```

### Tokenize Text

[LlamaCppTokenizer API](/api/classes/LlamaCppTokenizer)

```ts
import { LlamaCppTokenizer, countTokens } from "modelfusion";

const tokenizer = new LlamaCppTokenizer();

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
import { LlamaCppTextGenerationModel } from "modelfusion";

const model = new LlamaCppTextGenerationModel({
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

#### Instruction prompt format

```
<s>[INST] <<SYS>>
${ system prompt }
<</SYS>>

{ instruction } [/INST]
```

You can use the [Llama 2 format for instruction prompts](/api/modules#mapinstructionprompttollama2format):

```ts
const textStream = await streamText(
  new LlamaCppTextGenerationModel({
    // ...
  }).withPromptFormat(mapInstructionPromptToLlama2Format()),
  {
    system: "You are a celebrated poet.",
    instruction: "Write a short story about a robot learning to love.",
  }
);
```

#### Chat prompt format

```
<s>[INST] <<SYS>>
${ system prompt }
<</SYS>>

${ user msg 1 } [/INST] ${ model response 1 } </s><s>[INST] ${ user msg 2 } [/INST] ${ model response 2 } </s><s>[INST] ${ user msg 3 } [/INST]
```

You can use the [Llama 2 format for chat prompts](/api/modules#mapchatprompttollama2format):

```ts
const textStream = await streamText(
  new LlamaCppTextGenerationModel({
    // ...
  }).withPromptFormat(mapChatPromptToLlama2Format()),
  [
    { system: "You are a celebrated poet." },
    { user: "Write a short story about a robot learning to love." },
    { ai: "Once upon a time, there was a robot who learned to love." },
    { user: "That's a great start!" },
  ]
);
```

### Alpaca prompt format

Alpaca and several other models use the [Alpaca prompt format](https://github.com/tatsu-lab/stanford_alpaca#data-release):

#### instruction prompt format

With input:

```
Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{instruction}

### Input:
{input}

### Response:
```

Without input:

```
Below is an instruction that describes a task. Write a response that appropriately completes the request.

### Instruction:
{instruction}

### Response:
```

You can use [mapInstructionPromptToAlpacaFormat()](/api/modules#mapinstructionprompttoalpacaformat) to create instruction prompts.

> ℹ️ Setting the system property overrides the Alpaca system prompt and can impact the model responses.

```ts
const textStream = await streamText(
  new LlamaCppTextGenerationModel({
    // ...
  }).withPromptFormat(mapInstructionPromptToAlpacaFormat()),
  {
    instruction: "You are a celebrated poet. Write a short story about:",
    input: "a robot learning to love.",
  }
);
```

### Vicuna prompt format

Vicuna and several other models use the Vicuna prompt format:

#### Chat prompt format

```
A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions.

USER: {prompt}
ASSISTANT:
```

You can use [mapChatPromptToVicunaFormat()](/api/modules#mapchatprompttovicunaformat) to create chat prompts.

> ℹ️ Setting the system property overrides the Vicuna system prompt and can impact the model responses.

```ts
const textStream = await streamText(
  new LlamaCppTextGenerationModel({
    // ...
  }).withPromptFormat(mapChatPromptToVicunaFormat()),
  [
    { user: "Write a short story about a robot learning to love." },
    { ai: "Once upon a time, there was a robot who learned to love." },
    { user: "That's a great start!" },
  ]
);
```
