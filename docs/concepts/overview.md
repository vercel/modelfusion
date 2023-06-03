---
sidebar_position: 2
---

# Library Overview

## Model Providers

Model providers offer APIs (either local or in the cloud) for using AI models, e.g. large language models (LLMs), image generation models, or speech-to-text models. `ai-utils.js` offers a variety of model providers that can be used interchangeably in the library functions.

### API Clients

The model provider API clients serve as robust client functions for accessing the APIs of various model providers such as OpenAI. Key features include providing data types for consistency, automatic parsing and validation of API response data, and comprehensive error handling. They act as a reliable fallback for specialized functions not covered elsewhere in the library. [Learn more...](/docs/model-providers/api-clients)

### Models

Models in `ai-utils.js` map specific model provider API calls to abstract model interfaces like text generation. They provide additional information regarding the API, set default parameters, and offer configurable settings for customization. These models help segregate parameter configuration from the actual call, facilitating the integration of API calls into run-aware functions. [Learn more...](/docs/model-providers/models)

## Library Functions

`ai-utils.js` offers a variety of high-level functions, e.g. generate text, that are built on top of model interfaces. They can be used directly or in functional composition. The library functions are run-aware and add prompts, retry management, and call logging. They also support swapping out models for other compatible models. [Learn more...](/docs/library-functions)
