---
sidebar_position: 0
---

# Getting Started

ModelFusion is a library for building AI apps, chatbots, and agents. It provides abstractions for working with AI models, vector indices, and tools. It was designed with the following goals in mind:

- **Provide type inference and validation**: ModelFusion uses TypeScript and [Zod](https://github.com/colinhacks/zod) to infer types whereever possible and to validate AI responses.
- **Flexibility and control**: AI application development can be complex and unique to each project. With ModelFusion, you have complete control over the prompts, the model settings, and the control flow of your application. You can also access the full responses from the models and metadata easily to build what you need.
- **Integrate support features**: Essential features like logging, retries, throttling, and error handling are integrated and easily configurable.

## Disclaimer

ModelFusion is in its initial development phase. Until version 1.0 there may be breaking changes.

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
