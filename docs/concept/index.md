---
sidebar_position: 0
---

# Introduction

`ai-utils.js` is a TypeScript-first library for building production-grade AI apps, chatbots, and agents. It provides a high-level API for concepts such as text generation, tokenization, embeddings, and image generation. Different providers are supported, including OpenAI, Cohere, Hugging Face, and Stability AI. `ai-utils.js` takes care of the low-level details like retries, throttling, and error handling.

### TypeScript-first

`ai-utils.js` is built with TypeScript at its core, designed to take full advantage of type inference, static typing, and the robust tooling TypeScript offers. We use a mix of functional and object-oriented programming, focusing on composition and immutability.

### Your prompts, model choices, and control flow

Building applications with AI is a complex task, and your requirements mean you must make unique choices. We give you complete control over the prompts, the model choices and settings, and the control flow of your application, because controlling these aspects is essential to building a production-grade application. You can also use our thin Provider API layer directly.

Having this amount of control is a trade-off: it'll require more work to get an initial prototype of your app up and running. To help you with this, we provide example prompts, recipes, and demo apps.

### Build for production

`ai-utils.js` is designed for production, not just for prototyping. Essential features like logging, cost and latency tracking, retries, throttling, and error handling are integrated from the outset. You're also given the flexibility to provide your own integrations and use provider-specific settings.

### Multi-modal support

Recognizing that AI applications involve more than just text, this library supports a variety of content types including voice and images, along with text and embeddings. This broadens its applicability and potential for creating richer, more engaging AI applications.

These principles have shaped the design and function of the library, aiming to provide you with a comprehensive, adaptable tool for your development needs.
