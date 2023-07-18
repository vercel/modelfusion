# ai-utils.js

> ### A TypeScript-first library for building AI apps, chatbots, and agents.

[![Created by Lars Grammel](https://img.shields.io/badge/created%20by-@lgrammel-4BBAAB.svg)](https://twitter.com/lgrammel)
[![NPM Version](https://img.shields.io/npm/v/ai-utils.js?color=33cd56&logo=npm)](https://www.npmjs.com/package/ai-utils.js)
[![MIT License](https://img.shields.io/github/license/lgrammel/ai-utils.js)](https://opensource.org/licenses/MIT)

[Quick Install](#quick-install) | [Usage](#usage-examples) | [Introduction](#introduction) | [Features](#features) | [Integrations](#integrations) | [Documentation](#documentation) | [Examples](#more-examples) | [ai-utils.dev](https://ai-utils.dev)

> **⚠️ `ai-utils.js` is currently in its initial experimental phase. Until version 0.1 there may be breaking changes in each release.**

## Quick Install

```bash
npm install ai-utils.js
```

## Usage Examples

You can provide API keys for the different [integrations](https://ai-utils.dev/integration/model-provider/) using environment variables (e.g., `OPENAI_API_KEY`) or pass them into the model constructors as options.

### [Generate Text](https://ai-utils.dev/guide/function/generate-text)

```ts
const text = await generateText(
  new OpenAITextGenerationModel({ model: "text-davinci-003" }),
  "Write a short story about a robot learning to love:\n\n"
);
```

### [Stream Text](https://ai-utils.dev/guide/function/stream-text)

```ts
const textStream = await streamText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
  [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user("A robot learning to love"),
  ]
);

for await (const textFragment of textStream) {
  process.stdout.write(textFragment);
}
```

### [Generate JSON](https://ai-utils.dev/guide/function/generate-json)

```ts
const json = await generateJson(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
  new OpenAIChatSingleFunctionPrompt({
    messages: [
      OpenAIChatMessage.system("You are a story writer. Write a story about:"),
      OpenAIChatMessage.user("A robot learning to love"),
    ],
    fn: {
      name: "story",
      description: "Write the story",
      parameters: z.object({
        title: z.string().describe("The title of the story"),
        content: z.string().describe("The content of the story"),
      }),
    },
  })
);
```

### [Transcribe Audio](https://ai-utils.dev/guide/function/transcribe-audio)

```ts
const transcription = await transcribe(
  new OpenAITranscriptionModel({ model: "whisper-1" }),
  {
    type: "mp3",
    data: await fs.promises.readFile("data/test.mp3"),
  }
);
```

### [Generate Image](https://ai-utils.dev/guide/function/generate-image)

```ts
const imageBase64 = await generateImage(
  new OpenAIImageGenerationModel({ size: "512x512" }),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

### [Embed Text](https://ai-utils.dev/guide/function/embed-text)

```ts
const embeddings = await embedTexts(
  new OpenAITextEmbeddingModel({ model: "text-embedding-ada-002" }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]
);
```

### [Tokenize Text](https://ai-utils.dev/guide/function/tokenize-text)

```ts
const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await countTokens(tokenizer, text);

const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```

### [Upserting and Retrieving Text Chunks from Vector Indices](https://ai-utils.dev/guide/text-chunks)

```ts
const texts = [
  "A rainbow is an optical phenomenon that can occur under certain meteorological conditions.",
  "It is caused by refraction, internal reflection and dispersion of light in water droplets resulting in a continuous spectrum of light appearing in the sky.",
  // ...
];

const vectorIndex = new MemoryVectorIndex<TextChunk>();
const embeddingModel = new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
});

// update an index - usually done as part of an ingestion process:
await upsertTextChunks({
  vectorIndex,
  embeddingModel,
  chunks: texts.map((text) => ({ content: text })),
});

// retrieve text chunks from the vector index - usually done at query time:
const results = await retrieveTextChunks(
  new VectorIndexSimilarTextChunkRetriever({
    vectorIndex,
    embeddingModel,
    maxResults: 3,
    similarityThreshold: 0.8,
  }),
  "rainbow and water droplets"
);
```

## Introduction

`ai-utils.js` is a TypeScript-first library for building AI apps, chatbots, and agents.

It provides functions for working with models, e.g. to [generate text](https://ai-utils.dev/guide/function/generate-text), [tokenize text](https://ai-utils.dev/guide/function/tokenize-text), [embed text](https://ai-utils.dev/guide/function/embed-text), [transcribe audio](https://ai-utils.dev/guide/function/transcribe-audio), and [generate images](https://ai-utils.dev/guide/function/generate-image).

`ai-utils.js` also contains functions for working with [text chunks and vector indices](https://ai-utils.dev/guide/text-chunks), e.g. upserting text chunks into a vector index and querying the index for similar text chunks.

### TypeScript-first

`ai-utils.js` is built with TypeScript at its core, designed to take full advantage of type inference, static typing, and the robust tooling TypeScript offers. We use a mix of object-oriented and functional programming, focusing on composition and immutability. [Zod](https://github.com/colinhacks/zod) is used for type validation when interacting with external systems, e.g. when retrieving data from vectors DBs or calling services.

### Stay in control

Building applications with AI is a complex task, and your requirements mean you must make unique choices. With `ai-utils.js`, you stay in complete control over the prompts, the model settings, and the control flow of your application.

### Example recipes, prompts, and demo apps

Having a large amount of control means that more work is required to get an initial prototype of your app up and running. We provide example [recipes & prompts](https://ai-utils.dev/tutorial/) as well as [demo apps](https://github.com/lgrammel/ai-utils.js/tree/main/examples) to help you get started.

### Taking care of the details

`ai-utils.js` is designed for production, not just for prototyping. Essential features like logging, retries, throttling, and error handling are integrated and easily configurable.

### Multi-modal support

Recognizing that AI applications involve more than just text, `ai-utils.js` supports a variety of content types including voice and images, along with text and embeddings. This broadens its applicability and potential for creating richer, more engaging AI applications.

## Features

- [Functions](https://ai-utils.dev/guide/function/)
  - [Generate text](https://ai-utils.dev/guide/function/generate-text)
  - [Stream text](https://ai-utils.dev/guide/function/stream-text)
  - [Generate JSON](https://ai-utils.dev/guide/function/generate-json)
  - [Embed Text](https://ai-utils.dev/guide/function/embed-text)
  - [Tokenize Text](https://ai-utils.dev/guide/function/tokenize-text)
  - [Transcribe Audio](https://ai-utils.dev/guide/function/transcribe-audio)
  - [Generate images](https://ai-utils.dev/guide/function/generate-image)
- Summarize text
- Split text
- [Text Chunks](https://ai-utils.dev/guide/text-chunks)
- [Run abstraction](https://ai-utils.dev/guide/run/)
  - [Abort signals](https://ai-utils.dev/guide/run/abort)
  - [Cost calculation](https://ai-utils.dev/guide/run/cost-calculation)
  - Call recording
- Utilities
  - [Retry strategies](https://ai-utils.dev/guide/util/retry)
  - [Throttling strategies](https://ai-utils.dev/guide/util/throttle)
  - Error handling

## Integrations

### Model Providers

|                                                                          | [OpenAI](https://ai-utils.dev/integration/model-provider/openai) | [Cohere](https://ai-utils.dev/integration/model-provider/cohere) | [Hugging Face](https://ai-utils.dev/integration/model-provider/huggingface) | [Llama.cpp](https://ai-utils.dev/integration/model-provider/llamacpp) | [Stability AI](https://ai-utils.dev/integration/model-provider/stability) | [Automatic1111](https://ai-utils.dev/integration/model-provider/automatic1111) |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Hosting                                                                  | cloud                                                            | cloud                                                            | cloud                                                                       | server (local)                                                        | cloud                                                                     | server (local)                                                                 |
| [Generate text](https://ai-utils.dev/guide/function/generate-text)       | ✅                                                               | ✅                                                               | ✅                                                                          | ✅                                                                    |                                                                           |                                                                                |
| [Stream text](https://ai-utils.dev/guide/function/stream-text)           | ✅                                                               | ✅                                                               |                                                                             | ✅                                                                    |                                                                           |                                                                                |
| [Generate JSON](https://ai-utils.dev/guide/function/generate-json)       | ✅                                                               |                                                                  |                                                                             |                                                                       |                                                                           |                                                                                |
| [Embed text](https://ai-utils.dev/guide/function/embed-text)             | ✅                                                               | ✅                                                               |                                                                             |                                                                       |                                                                           |                                                                                |
| [Tokenize text](https://ai-utils.dev/guide/function/tokenize-text)       | full                                                             | full                                                             |                                                                             | basic                                                                 |                                                                           |                                                                                |
| [Generate image](https://ai-utils.dev/guide/function/generate-image)     | ✅                                                               |                                                                  |                                                                             |                                                                       | ✅                                                                        | ✅                                                                             |
| [Transcribe audio](https://ai-utils.dev/guide/function/transcribe-audio) | ✅                                                               |                                                                  |                                                                             |                                                                       |                                                                           |                                                                                |
| [Cost calculation](https://ai-utils.dev/guide/run/cost-calculation)      | ✅                                                               |                                                                  |                                                                             |                                                                       |                                                                           |                                                                                |

### Vector Indices

- [Memory](https://ai-utils.dev/integration/vector-index/memory)
- [Pinecone](https://ai-utils.dev/integration/vector-index/pinecone)

## Documentation

- [Guide](https://ai-utils.dev/guide)
- [Examples & Tutorials](https://ai-utils.dev/tutorial)
- [Integrations](https://ai-utils.dev/integration/model-provider)
- [API Reference](https://ai-utils.dev/api/modules)

## More Examples

### [Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic)

Examples for the individual functions and objects.

### [PDF to Tweet](https://github.com/lgrammel/ai-utils.js/tree/main/examples/pdf-to-tweet)

> _console app_, _PDF parsing_, _recursive information extraction_, _in memory vector index, \_style example retrieval_, _OpenAI GPT-4_, _cost calculation_

Extracts information about a topic from a PDF and writes a tweet in your own style about it.

### [AI Chat (Next.JS)](https://github.com/lgrammel/ai-utils.js/tree/main/examples/ai-chat-next-js)

> _Next.js app_, _OpenAI GPT-3.5-turbo_, _streaming_, _abort handling_

A basic web chat with an AI assistant, implemented as a Next.js app.

### [Image generator (Next.js)](https://github.com/lgrammel/ai-utils.js/tree/main/examples/image-generator-next-js)

> _Next.js app_, _Stability AI image generation_

Create an 19th century painting image for your input.

### [Voice recording and transcription (Next.js)](https://github.com/lgrammel/ai-utils.js/tree/main/examples/voice-recording-next-js)

> _Next.js app_, _OpenAI Whisper_

Record audio with push-to-talk and transcribe it using Whisper, implemented as a Next.js app. The app shows a list of the transcriptions.

### [BabyAGI Classic](https://github.com/lgrammel/ai-utils.js/tree/main/examples/baby-agi)

> _console app_, _agent_, _BabyAGI_, _OpenAI text-davinci-003_

TypeScript implementation of the classic [BabyAGI](https://github.com/yoheinakajima/babyagi/blob/main/classic/babyagi.py) by [@yoheinakajima](https://twitter.com/yoheinakajima) without embeddings.
