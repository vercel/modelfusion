---
sidebar_position: 0
---

# Integration APIs

The `ai-utils.js` library includes API client functions for various integrations (for instance, OpenAI). These client functions enhance the integration APIs by including features such as:

- **Types:** They provide data types to ensure data consistency and integrity.
- **Output parsing & validation:** They automatically parse the API response data and validate its structure and values.
- **Error handling:** They detect and handle errors to ensure the smooth execution of your program.

The low-level API also serves as a fallback level for specific functionalities that might not be generalized enough to be used in other parts of `ai-utils.js`.

### Example Usage

For instance, you can use the OpenAI text completion API through `ai-utils.js` as follows:

```ts
import { generateOpenAITextCompletion } from "ai-utils.js/model/openai";

const response = await generateOpenAITextCompletion({
  apiKey: OPENAI_API_KEY,
  model: "text-davinci-003",
  prompt: "Write a short story about a robot learning to love:\n\n",
  temperature: 0.7,
  maxCompletionTokens: 500,
});

console.log(response.choices[0].text);
```

## Integration APIs (List)

### Open AI

- [Chat Completion](/api/modules/model_openai#generateopenaichatcompletion)
- [Chat Completion (stream)](/api/modules/model_openai#streamopenaichatcompletion)
- [Text Completion](/api/modules/model_openai#generateopenaitextcompletion)
- [Embedding](/api/modules/model_openai#generateopenaiembedding)
- [Transcription](/api/modules/model_openai#generateopenaitranscription)
- [Tokenization with TikToken (for model)](/api/modules/model_openai#gettiktokentokenizerformodel)
- [Tokenization with TikToken (for encoding)](/api/modules/model_openai#gettiktokentokenizerforencoding)

### Cohere

- [Text Completion](/api/modules/model_cohere#generatecoheretextcompletion)
