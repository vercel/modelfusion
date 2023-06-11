---
sidebar_position: 0
---

# Introduction

`ai-utils.js` is a TypeScript-first library for building AI apps, chatbots, and agents. It provides APIs for text generation, tokenization, embeddings, and image generation. A vector database abstraction allows you to store and query text embeddings (with similarity search).

## TypeScript-first

`ai-utils.js` is built with TypeScript at its core, designed to take full advantage of type inference, static typing, and the robust tooling TypeScript offers. We use a mix of object-oriented and functional programming, focusing on composition and immutability. [Zod](https://github.com/colinhacks/zod) is used for type validation when interacting with external systems, e.g. when retrieving data from vectors DBs or calling services.

## Stay in control

Building applications with AI is a complex task, and your requirements mean you must make unique choices. With `ai-utils.js`, you stay in complete control over the prompts, the model settings, and the control flow of your application.

## Example recipes, prompts, and demo apps

Having this amount of control means that more work is required to get an initial prototype of your app up and running. To help you with this, we provide example [prompts](https://ai-utils.dev/prompt/), [recipes](https://ai-utils.dev/recipe/), and [demo apps](https://github.com/lgrammel/ai-utils.js/tree/main/examples).

## Taking care of the details

`ai-utils.js` is designed for production, not just for prototyping. Essential features like logging, retries, throttling, and error handling are integrated and easily configurable.

## Multi-modal support

Recognizing that AI applications involve more than just text, `ai-utils.js` supports a variety of content types including voice and images, along with text and embeddings. This broadens its applicability and potential for creating richer, more engaging AI applications.
