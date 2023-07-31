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
import { LlamaCppTextEmbeddingModel, embedTexts } from "ai-utils.js";

const embeddings = await embedTexts(new LlamaCppTextEmbeddingModel(), [
  "At first, Nox didn't know what to do with the pup.",
  "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
]);
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

### Context Window Size

You can serve models with different context window sizes with your Llama.cpp server.
By default, the `contextWindowSize` property on the `LlamaCppTextGenerationModel` is set to `undefined`.
However, some functions that automatically optimize the prompt size (e.g., recursive summarization) require a context window size on the model.
You can set the context window size on the model by passing it as a parameter to the constructor.

```ts
import { LlamaCppTextGenerationModel } from "ai-utils.js";

const model = new LlamaCppTextGenerationModel({
  // Assuming the default Llama2 7B model is loaded, the context window size is 4096 tokens.
  // See https://www.philschmid.de/llama-2
  // Change value to match the context window size of the model you are using.
  contextWindowSize: 4096,
});
```
