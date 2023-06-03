---
sidebar_position: 0
---

# API Clients

The `ai-utils.js` library includes API client functions for various model providers (for instance, OpenAI). These client functions enhance the provider APIs by including features such as:

- **Types:** They provide data types to ensure data consistency and integrity.
- **Output parsing & validation:** They automatically parse the API response data and validate its structure and values. You can work with structured, typed output objects.
- **Error handling:** They detect and parse errors in the API response data to give you structured error information (including API call parameters etc.).

The provider API clients are very lightweight and only use the fetch API (for REST calls) or provider-specific SDKs (for SDK calls).
In particular, features such as rate limiting, retries, call logging, etc., are implemented at the provider model and library function levels, not at the provider API client level, to keep the library as lightweight as possible and give you complete control when using it.

The provider API clients also serve as a fallback level for specific functionalities that might not be generalized enough to be used in other parts of `ai-utils.js`.

### Example Usage

For instance, you can use the OpenAI text completion API through `ai-utils.js` as follows:

```ts
import { generateOpenAITextCompletion } from "ai-utils.js/model/openai";

const response = await generateOpenAITextCompletion({
  apiKey: OPENAI_API_KEY,
  model: "text-davinci-003",
  prompt: "Write a short story about a robot learning to love:\n\n",
  temperature: 0.7,
  maxTokens: 500,
});

console.log(response.choices[0].text);
```
