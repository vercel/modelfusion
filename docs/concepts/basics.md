---
sidebar_position: 1
---

# Basic Concepts

## API-Wrappers

ai-utils.js provides API wrapper functions for all its integrations. The wrapper functions add types, output parsing and error validation to the APIs to make it more convenient to use them.

### OpenAI

```ts
import { ... } from "ai-utils.js/provider/openai";
```

- generateOpenAITranscription
- generateOpenAIChatCompletion
- streamOpenAIChatCompletion
- generateOpenAITextCompletion
- getTiktokenTokenizerForModel/Encoding

## Models and Functions

ai-utils.js provides a layer of models and functions. It adds runs, call logging, composite and advanced functionality. However, some of the functionality that is available in the API wrappers might not be available on this level.

## Helpers

```ts
import { ... } from "ai-utils.js/util";
```

- AsyncQueue
- convertReadableStreamToAsyncIterator
- retryWithExponentialBackoff
