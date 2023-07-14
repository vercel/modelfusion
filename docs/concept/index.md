---
sidebar_position: 0
---

# Introduction

`ai-utils.js` is a TypeScript-first library for building AI apps, chatbots, and agents.

It provides functions for working with models, e.g. to [generate text](/concept/function/generate-text), [tokenize text](/concept/function/tokenize-text), [embed text](/concept/function/embed-text), [transcribe audio](/concept/function/transcribe-audio), and [generate images](/concept/function/generate-image).

`ai-utils.js` also contains functions for working with [text chunks and vector indices](/concept/text-chunks), e.g. upserting text chunks into a vector index and querying the index for similar text chunks.

## TypeScript-first

`ai-utils.js` is built with TypeScript at its core, designed to take full advantage of type inference, static typing, and the robust tooling TypeScript offers. We use a mix of object-oriented and functional programming, focusing on composition and immutability. [Zod](https://github.com/colinhacks/zod) is used for type validation when interacting with external systems, e.g. when retrieving data from vectors DBs or calling services.

## Stay in control

Building applications with AI is a complex task, and your requirements mean you must make unique choices. With `ai-utils.js`, you stay in complete control over the prompts, the model settings, and the control flow of your application.

## Example recipes, prompts, and demo apps

Having a large amount of control means that more work is required to get an initial prototype of your app up and running. We provide example [recipes & prompts](/recipe/) as well as [demo apps](https://github.com/lgrammel/ai-utils.js/tree/main/examples) to help you get started.

## Taking care of the details

`ai-utils.js` is designed for production, not just for prototyping. Essential features like logging, retries, throttling, and error handling are integrated and easily configurable.

## Multi-modal support

Recognizing that AI applications involve more than just text, `ai-utils.js` supports a variety of content types including voice and images, along with text and embeddings. This broadens its applicability and potential for creating richer, more engaging AI applications.
