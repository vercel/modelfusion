# ai-utils.js

> ### A TypeScript-first library for building production-grade AI apps, chatbots, and agents.

[![Created by Lars Grammel](https://img.shields.io/badge/created%20by-@lgrammel-4BBAAB.svg)](https://twitter.com/lgrammel)
[![NPM Version](https://img.shields.io/npm/v/ai-utils.js?color=33cd56&logo=npm)](https://www.npmjs.com/package/ai-utils.js)
[![MIT License](https://img.shields.io/github/license/lgrammel/ai-utils.js)](https://opensource.org/licenses/MIT)

[Quick Install](#quick-install) | [Introduction](#introduction) | [Features](#features) | [Integrations](#integrations) | [Documentation](#documentation) | [Examples](#examples) | [ai-utils.dev](https://ai-utils.dev)

**⚠️ `ai-utils.js` is currently in its initial experimental phase. Until version 0.1 there may be breaking changes in each release.**

## Quick Install

```bash
npm install --save ai-utils.js
```

## Introduction

`ai-utils.js` is a TypeScript-first library for building production-grade AI apps, chatbots, and agents. It provides a high-level API for concepts such as text generation, tokenization, embeddings, and image generation. Different providers are supported, including OpenAI, Cohere, Hugging Face, and Stability AI. `ai-utils.js` takes care of the low-level details like retries, throttling, and error handling.

### TypeScript-first

`ai-utils.js` is built with TypeScript at its core, designed to take full advantage of type inference, static typing, and the robust tooling TypeScript offers. We use a mix of functional and object-oriented programming, focusing on composition and immutability. [Zod](https://github.com/colinhacks/zod) is used for type validation when interacting with external systems, e.g. when retrieving data from vectors DBs or calling APIs.

### Your prompts, model choices, and control flow

Building applications with AI is a complex task, and your requirements mean you must make unique choices. We give you complete control over the prompts, the model choices and settings, and the control flow of your application, because controlling these aspects is essential to building a production-grade application.

Having this amount of control is a trade-off: it'll require more work to get an initial prototype of your app up and running. To help you with this, we provide example prompts, recipes, and demo apps.

### Build for production

`ai-utils.js` is designed for production, not just for prototyping. Essential features like logging, cost and latency tracking, retries, throttling, and error handling are integrated from the outset. You're also given the flexibility to provide your own integrations and use model-provider-specific settings.

### Multi-modal support

Recognizing that AI applications involve more than just text, this library supports a variety of content types including voice and images, along with text and embeddings. This broadens its applicability and potential for creating richer, more engaging AI applications.

These principles have shaped the design and function of the library, aiming to provide you with a comprehensive, adaptable tool for your development needs.

## Features

- Text functions
  - [generate text](https://ai-utils.dev/concept/text/generate-text)
  - map
    - recursive text mapping (e.g. for summarization or extraction)
  - split
    - recursive character and token splitters
    - separator splitter
  - embed
  - tokenize
- Image functions
  - [generate image](https://ai-utils.dev/concept/text/generate-image)
- Audio functions
  - transcribe
- Prompt utilities
  - Fit recent messages chat prompt into context window
- Run abstraction for progress reporting and abort signals
- Retry management and throttling
- Error handling

## Integrations

### Model Providers

- [OpenAI](https://ai-utils.dev/integration/model-provider/openai) (text generation, text embedding, tokenization, image generation, audio transcription)
- [Cohere](https://ai-utils.dev/integration/model-provider/cohere) (text generation, text embedding, tokenization)
- [Hugging Face](https://ai-utils.dev/integration/model-provider/huggingface) (text generation)
- [Stability AI](https://ai-utils.dev/integration/model-provider/stability) (image generation)

### Vector DBs

- [In-Memory](https://ai-utils.dev/integration/vector-db/in-memory)
- [Pinecone](https://ai-utils.dev/integration/vector-db/pinecone)

## Documentation (at [ai-utils.dev](https://ai-utils.dev))

- [Concepts](https://ai-utils.dev/concept)
- [Integrations](https://ai-utils.dev/integration/model-provider)
- [Recipes](https://ai-utils.dev/recipe)
- [Prompt library](https://ai-utils.dev/prompt)
- [API Documentation](https://ai-utils.dev/api/modules)

## Examples

### [Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic)

Examples for the individual functions and objects.

### [PDF to Tweet](https://github.com/lgrammel/ai-utils.js/tree/main/examples/pdf-to-tweet)

> _console app_, _PDF parsing_, _recursive information extraction_, _in memory vector db_, _style example retrieval_, _OpenAI GPT-4_

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

> _terminal app_, _agent_, _BabyAGI_, _OpenAI text-davinci-003_

TypeScript implementation of the classic [BabyAGI](https://github.com/yoheinakajima/babyagi/blob/main/classic/babyagi.py) by [@yoheinakajima](https://twitter.com/yoheinakajima) without embeddings.
