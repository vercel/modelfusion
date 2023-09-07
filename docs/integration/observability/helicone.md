---
sidebar_position: 2
title: Helicone
---

# Helicone

## Setup

1. You can get an API key from [Helicone](https://www.helicone.ai/).
1. The API key can be configured as an environment variable (`HELICONE_API_KEY`) or passed in as an option into the API configuration constructor.
1. You can explore the recorded calls on their platform.

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/observability/helicone/)

ModelFusion supports Helicone for [OpenAI text and chat models](/integration/model-provider/openai) in the proxy integration setup.
You can change the `api` parameter to use a `HeliconeOpenAIApiConfiguration`.

### Example: OpenAI Chat with environment variables

```ts
const text = await generateText(
  new OpenAIChatModel({
    // uses the API keys from the OPENAI_API_KEY and HELICONE_API_KEY environment variables
    api: new HeliconeOpenAIApiConfiguration(),
    model: "gpt-3.5-turbo",
  })
  // ....
);
```

### Example: OpenAI Chat with API keys

```ts
const text = await generateText(
  new OpenAIChatModel({
    api: new HeliconeOpenAIApiConfiguration({
      openAIApiKey: myOpenAIApiKey,
      heliconeApiKey: myHeliconeApiKey,
    }),
    model: "gpt-3.5-turbo",
  })
  // ....
);
```
