---
sidebar_position: 1
---

# Library Structure

## Low-Level Integration APIs

ai-utils.js provides API wrapper functions for its integrations (e.g., OpenAI). The wrapper functions add **types**, **output parsing & validation**, and **error handling** to make it more convenient to use the integration APIs. They also provide you with a fallback level that you can use when some of the functionality is too specific to be used in other parts of ai-utils.js.

For example, you can use the Open AI text completion API as follows:

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

## Functions and Models

ai-utils.js provides a layer of models and functions. It adds runs, call logging, composite and advanced functionality. However, some of the functionality that is available in the API wrappers might not be available on this level.

## Helpers

```ts
import { ... } from "ai-utils.js/util";
```

- AsyncQueue
- convertReadableStreamToAsyncIterator
- retryWithExponentialBackoff
