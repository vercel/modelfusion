---
sidebar_position: 2
---

# OpenAI

[Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/openai)

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

const text = await chatModel.extractText(response);
```

## Models

- [Chat Generation Model (GPT-3.5, GPT-4)](/api/classes/OpenAIChatModel)
- [Text Generation Model](/api/classes/OpenAITextGenerationModel)
- [Text Embedding Model](/api/classes/OpenAITextEmbeddingModel)
- [Image Generation Model (DALL-E)](/api/classes/OpenAIImageGenerationModel)
- [Tokenization (TikToken)](/api/classes/TikTokenTokenizer)

## API Clients

- [Chat Generation (GPT-3.5, GPT-4)](/api/modules/#callopenaichatcompletionapi)
- [Chat Generation Streaming (GPT-3.5, GPT-4)](/api/modules/#streamopenaichatcompletionapi)
- [Text Generation](/api/modules/#callopenaitextgenerationapi)
- [Text Embedding](/api/modules/#callopenaitextembeddingapi)
- [Image Generation (DALL-E)](/api/modules/#callopenaiimagegenerationapi)
- [Transcription (Whisper)](/api/modules/#callopenaitranscriptionapi)
