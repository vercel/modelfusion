---
sidebar_position: 1
---

# Model Providers

Model providers (e.g., OpenAI) offer APIs (either local or in the cloud) for using AI models, e.g. large language models (LLMs), image generation models, or speech-to-text models.

#### Text and JSON Generation

|                                                                | [OpenAI](/integration/model-provider/openai) | [Cohere](/integration/model-provider/cohere) | [Llama.cpp](/integration/model-provider/llamacpp) | [Hugging Face](/integration/model-provider/huggingface) |
| -------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| [Generate text](/guide/function/generate-text)                 | ✅                                           | ✅                                           | ✅                                                | ✅                                                      |
| [Stream text](/guide/function/generate-text)                   | ✅                                           | ✅                                           | ✅                                                |                                                         |
| [Generate JSON](/guide/function/generate-json)                 | chat models                                  |                                              |                                                   |                                                         |
| [Generate JSON or Text](/guide/function/generate-json-or-text) | chat models                                  |                                              |                                                   |                                                         |
| [Embed text](/guide/function/embed-text)                       | ✅                                           | ✅                                           | ✅                                                | ✅                                                      |
| [Tokenize text](/guide/function/tokenize-text)                 | full                                         | full                                         | basic                                             |                                                         |

#### Image Generation

- [OpenAI (Dall·E)](/integration/model-provider/openai)
- [Stability AI](/integration/model-provider/stability)
- [Automatic1111](/integration/model-provider/automatic1111)

#### Speech Transcription

- [OpenAI (Whisper)](/integration/model-provider/openai)

#### Speech Synthesis

- [Eleven Labs](/integration/model-provider/elevenlabs)
