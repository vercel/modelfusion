---
sidebar_position: 7
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
