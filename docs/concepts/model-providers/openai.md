---
sidebar_position: 2
---

# OpenAI

[API documentation](/api/modules/model-provider_openai)
|
[Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/openai)

## Import

```ts
import { OpenAIChatModel, ... } from "ai-utils.js/model-provider/openai";
```

## Example

```ts
const chatModel = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
  model: "gpt-3.5-turbo",
  settings: { temperature: 0.7, maxTokens: 500 },
});

const response = await chatModel.generate([
  {
    role: "system",
    content:
      "You are an AI assistant. Follow the user's instructions carefully.",
  },
  {
    role: "user",
    content: "Hello, how are you?",
  },
]);

const text = await chatModel.extractOutput(response);
```

## Models

- [Chat Generation Model (GPT-3.5, GPT-4)](/api/classes/model-provider_openai.OpenAIChatModel)
- [Text Generation Model](/api/classes/model-provider_openai.OpenAITextGenerationModel)
- [Text Embedding Model](/api/classes/model-provider_openai.OpenAITextEmbeddingModel)
- [Image Generation Model (DALL-E)](/api/classes/model-provider_openai.OpenAIImageGenerationModel)

## API Clients

- [Chat Generation (GPT-3.5, GPT-4)](/api/modules/model-provider_openai#generateopenaichatcompletion)
- [Chat Generation Streaming (GPT-3.5, GPT-4)](/api/modules/model-provider_openai#streamopenaichatcompletion)
- [Text Generation](/api/modules/model-provider_openai#generateopenaitextcompletion)
- [Text Embedding](/api/modules/model-provider_openai#generateopenaiembedding)
- [Transcription (Whisper)](/api/modules/model-provider_openai#generateopenaitranscription)
- [Tokenization with TikToken (for model)](/api/modules/model-provider_openai#gettiktokentokenizerformodel)
- [Tokenization with TikToken (for encoding)](/api/modules/model-provider_openai#gettiktokentokenizerforencoding)
- [Image Generation (DALL-E)](/api/modules/model-provider_openai#generateopenaiimage)
