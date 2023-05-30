---
sidebar_position: 1
---

# Library Structure

## Provider API Clients

The provider API clients serve as robust client functions for accessing the APIs of various providers such as OpenAI. Key features include providing data types for consistency, automatic parsing and validation of API response data, and comprehensive error handling. They act as a reliable fallback for specialized functions not covered elsewhere in the library. [Learn more...](/concepts/library-structure/provider-api-clients)

## Provider Models

Provider models in `ai-utils.js` map specific provider API calls to abstract model interfaces like text generation. They provide additional information regarding the API, set default parameters, and offer configurable settings for customization. These models help segregate parameter configuration from the actual call, facilitating the integration of API calls into run-aware functions. [Learn more...](/concepts/library-structure/provider-models)

## Library Functions

`ai-utils.js` offers a variety of high-level functions, e.g. generate text, that are built on top of model interfaces. They can be used directly or in functional composition. The library functions are run-aware and add prompts, retry management, and call logging. They also support swapping out models for other compatible models. [Learn more...](/concepts/library-structure/library-functions)
