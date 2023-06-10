---
sidebar_position: 0
---

# Introduction

`ai-utils.js` is a TypeScript-first library for building AI apps, chatbots, and agents. It provides APIs for text generation, tokenization, embeddings, and image generation. Different providers are supported, including OpenAI, Cohere, Hugging Face, and Stability AI.

## TypeScript-first

`ai-utils.js` is built with TypeScript at its core, designed to take full advantage of type inference, static typing, and the robust tooling TypeScript offers. We use a mix of object-oriented and functional programming, focusing on composition and immutability. [Zod](https://github.com/colinhacks/zod) is used for type validation when interacting with external systems, e.g. when retrieving data from vectors DBs or calling services.

## Your prompts, model choices, and control flow

Building applications with AI is a complex task, and your requirements mean you must make unique choices. We give you complete control over the prompts, the model settings, and the control flow of your application, because controlling these aspects is essential to building a production-grade application.

Having this amount of control is a trade-off: it'll require more work to get an initial prototype of your app up and running. To help you with this, we provide example prompts, recipes, and demo apps.

## Taking care of the details

`ai-utils.js` is designed for production, not just for prototyping. Essential features like logging, retries, throttling, and error handling are integrated from the outset.

## Multi-modal support

Recognizing that AI applications involve more than just text, this library supports a variety of content types including voice and images, along with text and embeddings. This broadens its applicability and potential for creating richer, more engaging AI applications.
