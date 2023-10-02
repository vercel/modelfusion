---
sidebar_position: 0
---

# Getting Started

ModelFusion is a library for building AI apps, chatbots, and agents. It provides abstractions for AI models, vector indices, and tools.

- **Multimodal Support**: Beyond just LLMs, ModelFusion encompasses a diverse array of models including text generation, text-to-speech, speech-to-text, and image generation, allowing you to build multifaceted AI applications with ease.
- **Flexibility and control**: AI application development can be complex and unique to each project. With ModelFusion, you have complete control over the prompts and model settings, and you can access the raw responses from the models quickly to build what you need.
- **Type inference and validation**: ModelFusion uses TypeScript and [Zod](https://github.com/colinhacks/zod) to infer types wherever possible and to validate model responses.
- **Integrated support features**: Essential features like logging, retries, throttling, tracing, and error handling are built-in, helping you focus more on building your application.

:::note

ModelFusion is in its initial development phase. Until version 1.0 there may be breaking changes, because I am still exploring the API design. Feedback and suggestions are welcome.

:::

## Installation

```sh
npm install modelfusion
```

Or use a template: [ModelFusion terminal app starter](https://github.com/lgrammel/modelfusion-terminal-app-starter)

## API Keys

You can provide API keys for the different [providers](/integration/model-provider/) using environment variables (e.g., `OPENAI_API_KEY`) or by passing them in as options to the model constructors.

## Requirements

- [Node.js](https://nodejs.org/en/download/) version 18 or above. ModelFusion uses the Node.js fetch API and parts of the Web Streams API, which were not enabled by default before Node 18.
