# ai-utils.js

> ### A TypeScript-first library for building AI apps, chatbots, and agents.

[![Created by Lars Grammel](https://img.shields.io/badge/created%20by-@lgrammel-4BBAAB.svg)](https://twitter.com/lgrammel)
[![NPM Version](https://img.shields.io/npm/v/ai-utils.js?color=33cd56&logo=npm)](https://www.npmjs.com/package/ai-utils.js)
[![MIT License](https://img.shields.io/github/license/lgrammel/ai-utils.js)](https://opensource.org/licenses/MIT)

[Quick Install](#quick-install) | [Usage Examples](#usage-examples) | [Introduction](#introduction) | [Features](#features) | [Integrations](#integrations) | [Documentation](#documentation) | [Examples](#examples) | [ai-utils.dev](https://ai-utils.dev)

**⚠️ `ai-utils.js` is currently in its initial experimental phase. Until version 0.1 there may be breaking changes in each release.**

## Quick Install

```bash
npm install ai-utils.js
```

## Usage Examples

You can provide API keys for the different [providers](https://ai-utils.dev/integration/model-provider/) using environment variables (e.g., `OPENAI_API_KEY`) or pass them into the model constructors as options.

### Text Generation

```ts
import { OpenAITextGenerationModel } from "ai-utils.js";

const model = new OpenAITextGenerationModel({
  model: "text-davinci-003",
  temperature: 0.7,
  maxTokens: 500,
});

const text = await model.generateText(
  "Write a short story about a robot learning to love:\n\n"
);
```

### JSON generation

```ts
const model = new OpenAIChatModel({
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  maxTokens: 1000,
});

const json = await model.generateJson(
  [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user("A robot learning to love"),
  ],
  {
    name: "story",
    description: "Write the story",
    parameters: z.object({
      title: z.string().describe("The title of the story"),
      content: z.string().describe("The content of the story"),
    }),
  }
);
```

### Transcription

```ts
import fs from "node:fs";
import { OpenAITranscriptionModel } from "ai-utils.js";

const data = await fs.promises.readFile("data/test.mp3");

const model = new OpenAITranscriptionModel({ model: "whisper-1" });

const transcription = await model.transcribe({
  type: "mp3",
  data,
});
```

### Image Generation

```ts
import { OpenAIImageGenerationModel } from "ai-utils.js";

const model = new OpenAIImageGenerationModel({
  size: "512x512",
});

const imageBase64 = await model.generateImage(
  "the wicked witch of the west in the style of early 19th century painting"
);
```

### Text Embedding

```ts
import { OpenAITextEmbeddingModel } from "ai-utils.js";

const model = new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
});

const embeddings = await model.embedTexts([
  "At first, Nox didn't know what to do with the pup.",
  "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
]);
```

### Vector DB

```ts
import { MemoryStore, OpenAITextEmbeddingModel, VectorDB } from "ai-utils.js";

const texts = [
  "A rainbow is an optical phenomenon that can occur under certain meteorological conditions.",
  "It is caused by refraction, internal reflection and dispersion of light in water droplets resulting in a continuous spectrum of light appearing in the sky.",
  // ...
];

const vectorDB = new VectorDB({
  store: new MemoryStore(),
  embeddingModel: new OpenAITextEmbeddingModel({
    model: "text-embedding-ada-002",
  }),
});

await vectorDB.upsertMany({
  keyTexts: texts,
  data: texts.map((text) => ({ text })),
});

const results = await vectorDB.queryByText({
  queryText: "rainbow and water droplets",
  maxResults: 3,
  similarityThreshold: 0.8,
});
```

### Tokenization

```ts
import { TikTokenTokenizer } from "ai-utils.js";

const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await tokenizer.countTokens(text);
const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```

## Introduction

`ai-utils.js` is a TypeScript-first library for building AI apps, chatbots, and agents. It provides APIs for [text generation](https://ai-utils.dev/concept/model/text-generation), [json generation](https://ai-utils.dev/concept/model/json-generation), [tokenization](https://ai-utils.dev/concept/model/text-tokenization), [embeddings](https://ai-utils.dev/concept/model/text-embedding), [transcription](https://ai-utils.dev/concept/model/transcription), and [image generation](https://ai-utils.dev/concept/model/image-generation). The [vector DB abstraction](https://ai-utils.dev/concept/vector-db) allows you to store and query text embeddings with similarity search.

### TypeScript-first

`ai-utils.js` is built with TypeScript at its core, designed to take full advantage of type inference, static typing, and the robust tooling TypeScript offers. We use a mix of object-oriented and functional programming, focusing on composition and immutability. [Zod](https://github.com/colinhacks/zod) is used for type validation when interacting with external systems, e.g. when retrieving data from vectors DBs or calling services.

### Stay in control

Building applications with AI is a complex task, and your requirements mean you must make unique choices. With `ai-utils.js`, you stay in complete control over the prompts, the model settings, and the control flow of your application.

### Example recipes, prompts, and demo apps

Having a large amount of control means that more work is required to get an initial prototype of your app up and running. We provide example [recipes & prompts](https://ai-utils.dev/recipe/) as well as [demo apps](https://github.com/lgrammel/ai-utils.js/tree/main/examples) to help you get started.

### Taking care of the details

`ai-utils.js` is designed for production, not just for prototyping. Essential features like logging, retries, throttling, and error handling are integrated and easily configurable.

### Multi-modal support

Recognizing that AI applications involve more than just text, `ai-utils.js` supports a variety of content types including voice and images, along with text and embeddings. This broadens its applicability and potential for creating richer, more engaging AI applications.

## Features

- Models
  - [Text generation](https://ai-utils.dev/concept/model/text-generation)
  - [JSON generation](https://ai-utils.dev/concept/model/json-generation)
  - [Text embedding](https://ai-utils.dev/concept/model/text-embedding)
  - [Text tokenization](https://ai-utils.dev/concept/model/text-tokenization)
  - [Transcription](https://ai-utils.dev/concept/model/transcription)
  - [Image generation](https://ai-utils.dev/concept/model/image-generation)
- Text summarization
- Text splitting
- [Vector DBs](https://ai-utils.dev/concept/vector-db)
- [Run abstraction](https://ai-utils.dev/concept/run/)
  - [Abort signals](https://ai-utils.dev/concept/run/abort)
  - [Cost calculation](https://ai-utils.dev/concept/run/cost-calculation)
  - Call recording
  - Progress reporting
- Utilities
  - [Retry strategies](https://ai-utils.dev/concept/util/retry)
  - [Throttling strategies](https://ai-utils.dev/concept/util/throttle)
  - Error handling

## Integrations

### Model Providers

- [OpenAI](https://ai-utils.dev/integration/model-provider/openai) (text generation, json generation, text embedding, tokenization, image generation, audio transcription, cost calculation)
- [Cohere](https://ai-utils.dev/integration/model-provider/cohere) (text generation, text embedding, tokenization)
- [Hugging Face](https://ai-utils.dev/integration/model-provider/huggingface) (text generation)
- [Stability AI](https://ai-utils.dev/integration/model-provider/stability) (image generation)
- [Automatic1111](https://ai-utils.dev/integration/model-provider/automatic1111) (image generation)

### Vector DBs

- [Memory](https://ai-utils.dev/integration/vector-db/memory)
- [Pinecone](https://ai-utils.dev/integration/vector-db/pinecone)

## Documentation (at [ai-utils.dev](https://ai-utils.dev))

- [Concepts](https://ai-utils.dev/concept)
- [Integrations](https://ai-utils.dev/integration/model-provider)
- [Recipes & Prompts](https://ai-utils.dev/recipe)
- [API Documentation](https://ai-utils.dev/api/modules)

## More Examples

### [Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic)

Examples for the individual functions and objects.

### [PDF to Tweet](https://github.com/lgrammel/ai-utils.js/tree/main/examples/pdf-to-tweet)

> _console app_, _PDF parsing_, _recursive information extraction_, _in memory vector db_, _style example retrieval_, _OpenAI GPT-4_, _cost calculation_

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
