---
sidebar_position: 1
---

# Library Structure

The `ai-utils.js` library offers two primary sets of capabilities: low-level integration APIs and models.

## Low-Level Integration APIs

The library's low-level integration APIs serve as robust client functions for various integrations, like OpenAI. Key features include providing data types for consistency, automatic parsing and validation of API response data, and comprehensive error handling. They act as a reliable fallback for specialized functions not covered elsewhere in the library. [Learn more...](/concepts/low-level-integration-apis)

## Models

Models in `ai-utils.js` map specific vendor API calls to broader concepts like text generation. They provide additional information regarding the API, set default parameters, and offer configurable settings for customization. These models help segregate parameter configuration from the actual call, facilitating the integration of API calls into run-aware functions. [Learn more...](/concepts/models)
