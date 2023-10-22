---
sidebar_position: 0
---

# Getting Started

ModelFusion is a library for building AI applications, chatbots, and agents. Here are the main features:

- **Multimodal**: ModelFusion supports a wide range of models including text generation, image generation, text-to-speech, speech-to-text, and embedding models.
- **Streaming**: ModelFusion supports streaming for many generation models, e.g. text streaming, structure streaming, and full duplex speech streaming.
- **Utility functions**: ModelFusion provides functionality for tools and tool usage, vector indices, and guards functions.
- **Type inference and validation**: ModelFusion infers TypeScript types wherever possible and to validates model responses.
- **Observability and logging**: ModelFusion provides an observer framework and out-of-the-box logging support.
- **Resilience and Robustness**: ModelFusion ensures seamless operation through automatic retries, throttling, and error handling mechanisms.

:::note

ModelFusion is in its initial development phase. The main API is now mostly stable, but until version 1.0 there may be minor breaking changes. Feedback and suggestions are welcome.

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
