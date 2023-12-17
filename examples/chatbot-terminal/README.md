# Chatbot (Terminal)

> _Terminal app_, _chat_, _llama.cpp_

A terminal chat with a Llama.cpp server backend.

## Setup

Run the following commands:

```sh
npm install
```

## Usage

### Ollama Chat with ModelFusion chat prompt

See the [ModelFusion docs for llama.cpp](https://modelfusion.dev/integration/model-provider/ollama) for details on Ollama.

1. Start Ollama and pull the `llama2:chat` model
2. Run `npx tsx src/ollama-chat.ts`

### Ollama Chat with raw Ollama chat prompt

See the [ModelFusion docs for llama.cpp](https://modelfusion.dev/integration/model-provider/ollama) for details on Ollama.

1. Start Ollama and pull the `llama2:chat` model
2. Run `npx tsx src/ollama-chat-raw-prompt.ts`

### Llama.cpp

See the [ModelFusion docs for llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp) for details on Llama.cpp.

1. Start the llama.cpp server with the model that you want to serve, e.g. using `./server -m models/llama-2-7b-chat.GGUF.q4_0.bin -c 2048` (Mac)

2. Run either
   - `npx tsx src/llama2-prompt.ts` (for a Llama 2 specific prompt using their special tokens - does not work for all models)
   - `npx tsx src/default-prompt.ts` (for a more generic prompt that works with most models)
