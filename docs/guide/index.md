---
sidebar_position: 0
---

# Getting Started

`ai-utils.js` is a TypeScript-first library for building AI apps, chatbots, and agents. It provides abstractions for working with AI models, vector indices, and tools. It was design with the following goals in mind:

- **Provide type inference and validation**: `ai-utils.js` uses TypeScript and [Zod](https://github.com/colinhacks/zod) to infer types whereever possible and to validate AI responses.
- **Flexibility**: AI application development can be complex and unique to each project. With `ai-utils.js`, you have complete control over the prompts, the model settings, and the control flow of your application.
- **Integrate support features**: Essential features like logging, retries, throttling, and error handling are integrated and easily configurable.

## Disclaimer

`ai-utils.js` is currently in its initial development phase. **Until version 0.1 there may be breaking changes in each release.**

## Installation

```bash
npm install ai-utils.js
```

## API Keys

You can provide API keys for the different [providers](/integration/model-provider/) using environment variables (e.g., `OPENAI_API_KEY`) or by passing them in as options to the model constructors.

## Requirements

- [Node.js](https://nodejs.org/en/download/) version 18 or above. `ai-utils.js` uses the Node.js fetch API and parts of the Web Streams API, which were not enabled by default before Node 18.
