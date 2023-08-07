---
sidebar_position: 0
---

# Getting Started

ModelFusion is a library for building AI apps, chatbots, and agents. It provides abstractions for AI models, vector indices, and tools.

- **Type inference and validation**: ModelFusion uses TypeScript and [Zod](https://github.com/colinhacks/zod) to infer types wherever possible and to validate model responses.
- **Flexibility and control**: AI application development can be complex and unique to each project. With ModelFusion, you have complete control over the prompts and model settings, and you can access the raw responses from the models quickly to build what you need.
- **No chains and predefined prompts**: Use the concepts provided by JavaScript (variables, functions, etc.) and explicit prompts to build applications you can easily understand and control. Not black magic.
- **More than LLMs**: ModelFusion supports other models, e.g., text-to-image and voice-to-text, to help you build rich AI applications that go beyond just text.
- **Integrated support features**: Essential features like logging, retries, throttling, tracing, and error handling are built-in, helping you focus more on building your application.

:::note

ModelFusion is in its initial development phase. Until version 1.0 there may be breaking changes.

:::

## Installation

```sh
npm install modelfusion
```

You need to install `zod` and a matching version of `zod-to-json-schema` (peer dependencies):

```sh
npm install zod zod-to-json-schema
```

## API Keys

You can provide API keys for the different [providers](/integration/model-provider/) using environment variables (e.g., `OPENAI_API_KEY`) or by passing them in as options to the model constructors.

## Requirements

- [Node.js](https://nodejs.org/en/download/) version 18 or above. ModelFusion uses the Node.js fetch API and parts of the Web Streams API, which were not enabled by default before Node 18.
