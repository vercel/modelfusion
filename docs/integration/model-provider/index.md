---
sidebar_position: 1
---

# Model Providers

Model providers (e.g., OpenAI) offer APIs (either local or in the cloud) for using AI models, e.g. large language models (LLMs), image generation models, or speech-to-text models.

### [Generate Text](/guide/function/generate-text)

|                                                         | [Generate text](/guide/function/generate-text) | [Stream text](/guide/function/generate-text) | [Tokenize text](/guide/function/tokenize-text) |
| ------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| [OpenAI](/integration/model-provider/openai)            | ✅                                             | ✅                                           | full                                           |
| [Llama.cpp](/integration/model-provider/llamacpp)       | ✅                                             | ✅                                           | basic                                          |
| [Ollama](/integration/model-provider/ollama)            | ✅                                             | ✅                                           |                                                |
| [Hugging Face](/integration/model-provider/huggingface) | ✅                                             |                                              |                                                |
| [Cohere](/integration/model-provider/cohere)            | ✅                                             | ✅                                           | full                                           |
| [Anthropic](/integration/model-provider/anthropic)      | ✅                                             | ✅                                           |                                                |

### [Generate Structure](/guide/function/generate-structure)

- [OpenAI](/integration/model-provider/openai) chat models

### [Generate Tool Call](/guide/tools/generate-tool-call) and [Generate Tool Calls or Text](/guide/tools/generate-tool-calls-or-text)

- [OpenAI](/integration/model-provider/openai) chat models

### [Generate Image](/guide/function/generate-image)

- [OpenAI (Dall·E)](/integration/model-provider/openai)
- [Stability AI](/integration/model-provider/stability)
- [Automatic1111](/integration/model-provider/automatic1111)

### [Generate Speech](/guide/function/generate-speech)

- [Eleven Labs](/integration/model-provider/elevenlabs) (standard and duplex streaming)
- [LMNT](/integration/model-provider/lmnt) (standard)
- [OpenAI](/integration/model-provider/openai) (standard)

### [Generate Speech](/guide/function/generate-transcription)

- [OpenAI (Whisper)](/integration/model-provider/openai)

### [Embed Value](/guide/function/embed)

- [OpenAI](/integration/model-provider/openai)
- [Cohere](/integration/model-provider/cohere)
- [Llama.cpp](/integration/model-provider/llamacpp)
- [Ollama](/integration/model-provider/ollama)
- [Hugging Face](/integration/model-provider/huggingface)
