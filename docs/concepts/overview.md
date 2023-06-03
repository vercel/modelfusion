---
sidebar_position: 2
---

# Library Overview

## Model Providers

Model providers (e.g., OpenAI) offer APIs (either local or in the cloud) for using AI models, e.g. large language models (LLMs), image generation models, or speech-to-text models. `ai-utils.js` contains integrations for a variety of model providers that can be used interchangeably in the library functions. [Learn more...](/concepts/model-providers/)

## Library Functions

`ai-utils.js` offers a variety of high-level functions, e.g. generate text, that are built on top of model interfaces. They can be used directly or in functional composition. The library functions are run-aware and add prompts, retry management, and call logging. They also support swapping out models for other compatible models. [Learn more...](/concepts/library-functions)
