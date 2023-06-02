# ai-utils.js

> ### A TypeScript-first toolkit for building production-grade AI apps, chatbots and agents.

[![Created by Lars Grammel](https://img.shields.io/badge/created%20by-@lgrammel-4BBAAB.svg)](https://twitter.com/lgrammel)
[![NPM Version](https://img.shields.io/npm/v/ai-utils.js?color=33cd56&logo=npm)](https://www.npmjs.com/package/ai-utils.js)
[![MIT License](https://img.shields.io/github/license/lgrammel/ai-utils.js)](https://opensource.org/licenses/MIT)

[Quick Install](#quick-install) | [Introduction](#introduction) | [Features](#features) | [Integrations](#integrations) | [Documentation](#documentation) | [Examples](#examples)

## Quick Install

```bash
npm install --save ai-utils.js
```

## Introduction

`ai-utils.js` is a TypeScript-first toolkit for building production-grade AI apps, chatbots and agents.

It was built with four key guiding principles in mind:

### TypeScript-First

`ai-utils.js` is built with TypeScript at its core, designed to take full advantage of type inference, static typing, and the robust tooling TypeScript offers. We are using a mix of functional and object-oriented programming, with a focus on functional composition and immutability.

### Full User Control

We place control firmly in your hands. Rather than setting rigid control flows or automatic prompts, we provide you the freedom to program control as per your needs. The ability to override most settings is baked right in, and access to all provider API features is readily available should you need to delve into lower levels.

### Ready for Production

`ai-utils.js` is designed for production, not just for prototyping. Essential features like logging, cost and latency tracking, retries, throttling, and error handling are integrated from the outset. You're also given the flexibility to provide your own integrations and use provider-specific settings.

### Multi-Modal Support

Recognizing that AI applications involve more than just text, this library supports a variety of content types including voice and images, along with text and embeddings. This broadens its applicability and potential for creating richer, more engaging AI applications.

These principles have shaped the design and function of the library, aiming to provide you with a comprehensive, adaptable tool for your development needs.

## Features

- Text functions
  - generate, map, split, embed
- Text processing chains
  - recursive text mapping (e.g. for summarization or extraction)
  - split-map-filter-reduce for text processing
- Text splitters
  - Recursive character and token splitters
- Tokenization
- Prompt utilities
  - Fit recent messages chat prompt into context window
- In-memory vector DB
- Run abstraction for progress reporting and abort signals
- Retry management and throttling
- Error handling

## Providers

### OpenAI

- chat completions (regular, streaming) - GPT-4, GPT-3.5
- text completions (regular) - Davinci, Curie, Babbage, Ada
- embeddings
- tokenization (TikToken) and token counting (incl. message and prompt overhead tokens in chat)
- transcription - Whisper

### Cohere

- text generation
- embeddings

### Hugging Face

- text generation

### Stability AI

- image generation

## Documentation

- [Concepts](https://ai-utils.dev/concepts)
- [Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic)
- [API](https://ai-utils.dev/api/modules)

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
