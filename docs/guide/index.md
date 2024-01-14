---
sidebar_position: 0
---

# Getting Started

**ModelFusion** is an abstraction layer for integrating AI models into JavaScript and TypeScript applications, unifying the API for common operations such as **text streaming**, **structure generation**, and **tool usage**. It provides features to support production environments, including observability hooks, logging, and automatic retries. You can use ModelFusion to build AI applications, chatbots, and agents.

- **Vendor-neutral**: ModelFusion is a non-commercial open source project that is community-driven. You can use it with any supported provider.
- **Multi-modal**: ModelFusion supports a wide range of models including text generation, image generation, vision, text-to-speech, speech-to-text, and embedding models.
- **Type inference and validation**: ModelFusion infers TypeScript types wherever possible and validates model responses.
- **Observability and logging**: ModelFusion provides an observer framework and out-of-the-box logging support.
- **Resilience and robustness**: ModelFusion ensures seamless operation through automatic retries, throttling, and error handling mechanisms.
- **Built for production**: ModelFusion is fully tree-shakeable, can be used in serverless environments, and only uses a minimal set of dependencies.

:::note
ModelFusion is getting closer to a stable v1, which is expected in Q2/2024. The main API is now mostly stable, but until version 1.0 there may be breaking changes. Feedback and suggestions are welcome.
:::

## Installation

```sh
npm install modelfusion
```

Or use a start template:

- [ModelFusion terminal app starter](https://github.com/lgrammel/modelfusion-terminal-app-starter)
- [Next.js, Vercel AI SDK, Llama.cpp & ModelFusion starter](https://github.com/lgrammel/modelfusion-llamacpp-nextjs-starter)
- [Next.js, Vercel AI SDK, Ollama & ModelFusion starter](https://github.com/lgrammel/modelfusion-ollama-nextjs-starter)

## Next Step

[Learn about models and functions](/guide/function/)

## Getting Support

- [Join the ModelFusion Discord](https://discord.gg/GqCwYZATem)
- [Use the ModelFusion issue tracker](https://github.com/lgrammel/modelfusion/issues)
