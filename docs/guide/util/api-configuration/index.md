---
sidebar_position: 1
---

# API Configuration

Models can be configured with an [API configuration](/api/interfaces/ApiConfiguration) that defines how the model accesses the API.
The API configuration controls how the called URL is constructed, what authorization and configuration headers are sent, and how retry and throttling are handled.

Model providers usually provide a default API configuration is used automatically, e.g. the [OpenAIApiConfiguration](/api/classes/OpenAIApiConfiguration) for the [OpenAI integration](/integration/model-provider/openai).

## Usage

### Default model API configuration

The default API configuration for a model is usually used automatically.
It tries to read the API key from a corresponding environment variable, e.g. `OPENAI_API_KEY` for the [OpenAI integration](/integration/model-provider/openai), and uses default settings for the other configuration options.

### Customizing the model API configuration

You can create customize the default API configuration for a model type.
This is useful to set API keys and to define [throttling](/guide/util/api-configuration/throttle) and [retry](/guide/util/api-configuration/retry) strategies.

#### Example: Customized OpenAI API configuration

```ts
import { api, openai } from "modelfusion";

const model = openai.CompletionTextGenerator({
  api: openai.Api({
    apiKey: myApiKey,
    throttle: api.throttleMaxConcurrency({ maxConcurrentCalls: 1 }),
    retry: api.retryWithExponentialBackoff({
      maxTries: 8,
      initialDelayInMs: 1000,
      backoffFactor: 2,
    }),
  }),
  model: "gpt-3.5-turbo-instruct",
});
```

### API configuration with custom headers

When you are using custom internal setups or proxies, you might want to supply a custom base URL and custom headers.

You can use the [BaseUrlApiConfiguration](/api/classes/BaseUrlApiConfiguration) in this case:

#### Example: Customized OpenAI API configuration with custom headers

```ts
import { BaseUrlApiConfiguration, openai } from "modelfusion";

const model = openai.CompletionTextGenerator({
  api: new BaseUrlApiConfiguration({
    baseUrl: "https://openai.mycompany.com/v1/",
    headers: {
      Authorization: `Bearer ${myOpenAIApiKey}`,
      Custom: "A custom header, e.g. proxy settings",
    },
  }),
  model: "gpt-3.5-turbo-instruct",
});
```

### Fully custom API configuration

If you need a fully custom API configuration, you can implement the [ApiConfiguration](/api/interfaces/ApiConfiguration) interface in your own class.
