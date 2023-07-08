---
sidebar_position: 1
---

# Model Providers

Model providers (e.g., OpenAI) offer APIs (either local or in the cloud) for using AI models, e.g. large language models (LLMs), image generation models, or speech-to-text models.

## Available Providers

| Model Provider                                                                 | type           | text generation | text streaming | json generation | embedding | tokenization | image generation | transcription | cost calculation |
| ------------------------------------------------------------------------------ | -------------- | --------------- | -------------- | --------------- | --------- | ------------ | ---------------- | ------------- | ---------------- |
| [OpenAI](https://ai-utils.dev/integration/model-provider/openai)               | cloud          | ✅              | partial        | ✅              | ✅        | ✅           | ✅               | ✅            | ✅               |
| [Cohere](https://ai-utils.dev/integration/model-provider/cohere)               | cloud          | ✅              |                |                 | ✅        | ✅           |                  |               |
| [Hugging Face](https://ai-utils.dev/integration/model-provider/huggingface)    | cloud          | ✅              |                |                 |           |              |                  |
| [Stability AI](https://ai-utils.dev/integration/model-provider/stability)      | cloud          |                 |                |                 |           |              | ✅               |               |
| [Automatic1111](https://ai-utils.dev/integration/model-provider/automatic1111) | server (local) |                 |                |                 |           |              | ✅               |               |
