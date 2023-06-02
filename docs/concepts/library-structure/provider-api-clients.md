---
sidebar_position: 0
---

# Provider API Clients

The `ai-utils.js` library includes API client functions for various providers (for instance, OpenAI). These client functions enhance the provider APIs by including features such as:

- **Types:** They provide data types to ensure data consistency and integrity.
- **Output parsing & validation:** They automatically parse the API response data and validate its structure and values. You can work with structured, typed output objects.
- **Error handling:** They detect and parse errors in the API response data to give you structured error information (including API call parameters etc.).

The provider API clients are very lightweight and only use the fetch API (for REST calls) or provider-specific SDKs (for SDK calls).
In particular, features such as rate limiting, retries, call logging, etc., are implemented at the provider model and library function levels, not at the provider API client level, to keep the library as lightweight as possible and give you complete control when using it.

The provider API clients also serve as a fallback level for specific functionalities that might not be generalized enough to be used in other parts of `ai-utils.js`.

### Example Usage

For instance, you can use the OpenAI text completion API through `ai-utils.js` as follows:

```ts
import { generateOpenAITextCompletion } from "ai-utils.js/provider/openai";

const response = await generateOpenAITextCompletion({
  apiKey: OPENAI_API_KEY,
  model: "text-davinci-003",
  prompt: "Write a short story about a robot learning to love:\n\n",
  temperature: 0.7,
  maxTokens: 500,
});

console.log(response.choices[0].text);
```

## Provider API Clients (List)

### OpenAI

- [Chat Completion](/api/modules/provider_openai#generateopenaichatcompletion)
- [Chat Completion (stream)](/api/modules/provider_openai#streamopenaichatcompletion)
- [Text Completion](/api/modules/provider_openai#generateopenaitextcompletion)
- [Embedding](/api/modules/provider_openai#generateopenaiembedding)
- [Transcription](/api/modules/provider_openai#generateopenaitranscription)
- [Tokenization with TikToken (for model)](/api/modules/provider_openai#gettiktokentokenizerformodel)
- [Tokenization with TikToken (for encoding)](/api/modules/provider_openai#gettiktokentokenizerforencoding)

### Cohere

- [Text Completion](/api/modules/provider_cohere#generatecoheretextcompletion)
- [Embedding](/api/modules/provider_cohere#generatecohereembedding)

### Hugging Face

- [Text Completion](/api/modules/provider_huggingface#generatehuggingfacetextcompletion)

### Stability AI

- [Image Generation](/api/modules/provider_stability#generatestabilityimage)
