---
sidebar_position: 1
title: Basic Examples
---

You can find many basic examples in the [examples/basic/src](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src) folder on GitHub.

## Usage

In the `examples/basic` folder:

1. Create .env file with the necessary keys for the [integrations](/integration/model-provider) that you want to use:

```
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
COHERE_API_KEY="YOUR_COHERE_API_KEY"
HUGGINGFACE_API_KEY="YOUR_HUGGINGFACE_API_KEY"
...
```

2. Setup:

```sh
pnpm install
```

3. Run any example. You can explore the `src` folder to find the examples:

```sh
pnpm tsx src/path/to/example.ts
```
