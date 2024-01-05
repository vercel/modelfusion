---
sidebar_position: 7
---

# Headers

You can configure both fixed and dynamic headers for an API configuration.

## Usage

### Setting fixed headers

Example for [Automatic1111](/integration/model-provider/automatic111). The same approach works for other model providers.

```ts
import { ollama } from "modelfusion";

const api = automatic1111.Api({
  headers: {
    // setting a fixed user/password authorization header:
    Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString(
      "base64"
    )}`,
  },
});
```

### Setting dynamic call headers

You can pass a `customCallHeaders` function into API configurations to add custom headers. The function is called with `functionType`, `functionId`, `run`, and `callId` parameters.

Example for [Helicone](/integration/observability/helicone). The same approach works for model providers.

```ts
import { ollama } from "modelfusion";

const api = new HeliconeOpenAIApiConfiguration({
  customCallHeaders: ({ functionId, callId }) => ({
    "Helicone-Property-FunctionId": functionId,
    "Helicone-Property-CallId": callId,
  }),
});
```
