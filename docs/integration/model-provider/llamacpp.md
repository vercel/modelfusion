---
sidebar_position: 5
---

# Llama.cpp

Generate text using [llama.cpp](https://github.com/ggerganov/llama.cpp). You can run the llama.cpp server locally or remote.

## Setup

1. Install [llama.cpp](https://github.com/ggerganov/llama.cpp) following the instructions in the `llama.cpp` repository.
1. Download the models that you want to use and try it out with llama.cpp.
   - [Search for GGML models on Hugging Face](https://huggingface.co/models?sort=trending&search=ggml)
1. Start the llama.cpp server with the model that you want to serve, e.g. using `./server -m models/llama-7b.ggmlv3.q4_K_M.bin -c 2048` (Mac)
   - [llama.cpp server docs](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)

## Usage

[Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/llamacpp)

### Generate Text

[LlamaCppTextGenerationModel API](/api/classes/LlamaCppTextGenerationModel)

```ts
import { LlamaCppTextGenerationModel, generateText } from "ai-utils.js";

const text = await generateText(
  new LlamaCppTextGenerationModel({ nPredict: 256 }),
  "Write a short story about a robot learning to love:\n\n"
);
```

### Stream Text

[LlamaCppTextGenerationModel API](/api/classes/LlamaCppTextGenerationModel)

```ts
import { LlamaCppTextGenerationModel, streamText } from "ai-utils.js";

const tokenStream = await streamText(
  new LlamaCppTextGenerationModel({ nPredict: 1024, temperature: 0.7 }),
  "Write a short story about a robot learning to love:\n\n"
);

for await (const token of tokenStream) {
  process.stdout.write(token);
}
```

### Tokenize Text

[LlamaCppTokenizer API](/api/classes/LlamaCppTokenizer)

```ts
import { LlamaCppTokenizer, countTokens } from "ai-utils.js";

const tokenizer = new LlamaCppTokenizer();

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await countTokens(tokenizer, text);
const tokens = await tokenizer.tokenize(text);

console.log("countTokens", tokenCount);
console.log("tokenize", tokens);
```
