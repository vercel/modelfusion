---
sidebar_position: 3
---

# Llama.cpp

Generate text using [llama.cpp](https://github.com/ggerganov/llama.cpp). You can run the llama.cpp server locally or remote.

## Setup

1. Install [llama.cpp](https://github.com/ggerganov/llama.cpp) following the instructions in the `llama.cpp` repository.
1. Download the models that you want to use and try it out with llama.cpp.
   - [Search for GGML models on Hugging Face](https://huggingface.co/models?sort=trending&search=ggml)
1. Start the llama.cpp server with the model that you want to serve:
   - e.g., `./server -m models/llama-2-7b-chat.ggmlv3.q4_K_M.bin -c 4096` (Mac)
   - For generating embeddings, you need to start the server with the `--embedding` flag.
   - [llama.cpp server docs](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/llamacpp)

### Generate Text

[LlamaCppTextGenerationModel API](/api/classes/LlamaCppTextGenerationModel)

Consider [mapping the prompt to the prompt format](#prompt-mappings) that your model was trained on.

```ts
import { LlamaCppTextGenerationModel, generateText } from "modelfusion";

const text = await generateText(
  new LlamaCppTextGenerationModel({ nPredict: 256 }),
  "Write a short story about a robot learning to love:\n\n"
);
```

### Stream Text

[LlamaCppTextGenerationModel API](/api/classes/LlamaCppTextGenerationModel)

Consider [mapping the prompt to the prompt format](#prompt-mappings) that your model was trained on.

```ts
import { LlamaCppTextGenerationModel, streamText } from "modelfusion";

const textStream = await streamText(
  new LlamaCppTextGenerationModel({ nPredict: 1024, temperature: 0.7 }),
  "Write a short story about a robot learning to love:\n\n"
);

for await (const textFragment of textStream) {
  process.stdout.write(textFragment);
}
```

### Text Embedding

[LlamaCppTextEmbeddingModel API](/api/classes/LlamaCppTextEmbeddingModel)

```ts
import { LlamaCppTextEmbeddingModel, embedTexts } from "modelfusion";

const embeddings = await embedTexts(new LlamaCppTextEmbeddingModel(), [
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

## Prompt Mappings

Many models are trained on specific prompts.
You can use [prompt mappings](/guide/function/generate-text/prompt-mapping) to use higher-level prompt formats such
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

You can use the [InstructionToLlama2PromptMapping](/api/modules#instructiontollama2promptmapping) to create instruction prompts:

```ts
const textStream = await streamText(
  new LlamaCppTextGenerationModel({
    // ...
  }).mapPrompt(InstructionToLlama2PromptMapping()),
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

You can use the [ChatToLlama2PromptMapping](/api/modules#chattollama2promptmapping) to create instruction prompts:

```ts
const textStream = await streamText(
  new LlamaCppTextGenerationModel({
    // ...
  }).mapPrompt(ChatToLlama2PromptMapping()),
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

You can use the [InstructionToAlpacaPromptMapping](/api/modules#instructiontoalpacapromptmapping) to create instruction prompts.

> ℹ️ Setting the system property overrides the Alpaca system prompt and can impact the model responses.

```ts
const textStream = await streamText(
  new LlamaCppTextGenerationModel({
    // ...
  }).mapPrompt(InstructionToAlpacaPromptMapping()),
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

You can use the [ChatToVicunaPromptMapping](/api/modules#chattovicunapromptmapping) to create chat prompts.

> ℹ️ Setting the system property overrides the Vicuna system prompt and can impact the model responses.

```ts
const textStream = await streamText(
  new LlamaCppTextGenerationModel({
    // ...
  }).mapPrompt(ChatToVicunaPromptMapping()),
  [
    { user: "Write a short story about a robot learning to love." },
    { ai: "Once upon a time, there was a robot who learned to love." },
    { user: "That's a great start!" },
  ]
);
```
