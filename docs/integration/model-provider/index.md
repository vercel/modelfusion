---
sidebar_position: 1
---

# Model Providers

Model providers (e.g., OpenAI) offer APIs (either local or in the cloud) for using AI models, e.g. large language models (LLMs), image generation models, or speech-to-text models.

## Available Providers

|                                                    | [OpenAI](/integration/model-provider/openai) | [Cohere](/integration/model-provider/cohere) | [Hugging Face](/integration/model-provider/huggingface) | [Stability AI](/integration/model-provider/stability) | [Automatic1111](/integration/model-provider/automatic1111) | [Llama.cpp](/integration/model-provider/llamacpp) |
| -------------------------------------------------- | -------------------------------------------- | -------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| Hosting                                            | cloud                                        | cloud                                        | cloud                                                   | cloud                                                 | server (local)                                             | server (local)                                    |
| [Generate text](/concept/function/generate-text)   | ✅                                           | ✅                                           | ✅                                                      |                                                       |                                                            | ✅                                                |
| Stream text                                        | chat models                                  |                                              |                                                         |                                                       |                                                            | ✅                                                |
| [Generate JSON](/concept/function/generate-json)   | ✅                                           |                                              |                                                         |                                                       |                                                            |
| [Embed text](/concept/function/embed-text)         | ✅                                           | ✅                                           |                                                         |                                                       |                                                            |
| [Tokenize Text](/concept/function/tokenize)        | ✅                                           | ✅                                           |                                                         |                                                       |                                                            |
| [Generate Image](/concept/function/generate-image) | ✅                                           |                                              |                                                         | ✅                                                    | ✅                                                         |
| [Transcribe Audio](/concept/function/transcribe)   | ✅                                           |                                              |                                                         |                                                       |                                                            |
| [Cost calculation](/concept/run/cost-calculation)  | ✅                                           |                                              |                                                         |                                                       |                                                            |
