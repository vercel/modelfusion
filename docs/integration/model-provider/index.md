---
sidebar_position: 1
---

# Model Providers

Model providers (e.g., OpenAI) offer APIs (either local or in the cloud) for using AI models, e.g. large language models (LLMs), image generation models, or speech-to-text models.

### [Generate and Stream Text](/guide/function/generate-text)

|                                                | [OpenAI](/integration/model-provider/openai) | [Cohere](/integration/model-provider/cohere) | [Llama.cpp](/integration/model-provider/llamacpp) | [Hugging Face](/integration/model-provider/huggingface) |
| ---------------------------------------------- | -------------------------------------------- | -------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| [Generate text](/guide/function/generate-text) | ✅                                           | ✅                                           | ✅                                                | ✅                                                      |
| [Stream text](/guide/function/generate-text)   | ✅                                           | ✅                                           | ✅                                                |                                                         |
| [Tokenize text](/guide/function/tokenize-text) | full                                         | full                                         | basic                                             |                                                         |

### [Generate Structure](/guide/function/generate-structure) and [Generate Structure or Text](/guide/function/generate-structure-or-text)

- [OpenAI](/integration/model-provider/openai) chat models

### [Embed Text](/guide/function/embed-text)

- [OpenAI](/integration/model-provider/openai)
- [Cohere](/integration/model-provider/cohere)
- [Llama.cpp](/integration/model-provider/llamacpp)
- [Hugging Face](/integration/model-provider/huggingface)

### [Describe Image](/guide/function/describe-image)

- [Hugging Face](/integration/model-provider/huggingface)

### [Generate Image](/guide/function/generate-image)

- [OpenAI (Dall·E)](/integration/model-provider/openai)
- [Stability AI](/integration/model-provider/stability)
- [Automatic1111](/integration/model-provider/automatic1111)

### [Transcribe Speech](/guide/function/transcribe-speech)

- [OpenAI (Whisper)](/integration/model-provider/openai)

### [Synthesize Speech](/guide/function/synthesize-speech)

- [Eleven Labs](/integration/model-provider/elevenlabs)
- [LMNT](/integration/model-provider/lmnt)
