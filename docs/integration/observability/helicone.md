---
sidebar_position: 2
title: Helicone
---

# Helicone

## Setup

1. You can get an API key from [Helicone](https://www.helicone.ai/).
1. The API key can be configured as an environment variable (`HELICONE_API_KEY`) or passed in as an option into the API configuration constructor.
1. You can explore the recorded calls on the Helicone platform.

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/observability/helicone/)

ModelFusion supports Helicone for [OpenAI text and chat models](/integration/model-provider/openai) in the proxy integration setup.
You can change the `api` parameter to use a `HeliconeOpenAIApiConfiguration`.

### Example: Helicone & OpenAI chat with environment variables

```ts
import {
  HeliconeOpenAIApiConfiguration,
  generateText,
  openai,
} from "modelfusion";

const text = await generateText(
  openai.ChatTextGenerator({
    // uses the API keys from the OPENAI_API_KEY and HELICONE_API_KEY environment variables
    api: new HeliconeOpenAIApiConfiguration(),
    model: "gpt-3.5-turbo",
  })
  // ....
);
```

### Example: Helicone & OpenAI chat with API keys

```ts
import {
  HeliconeOpenAIApiConfiguration,
  generateText,
  openai,
} from "modelfusion";

const text = await generateText(
  openai.ChatTextGenerator({
    api: new HeliconeOpenAIApiConfiguration({
      openAIApiKey: myOpenAIApiKey,
      heliconeApiKey: myHeliconeApiKey,
    }),
    model: "gpt-3.5-turbo",
  })
  // ....
);
```

### Example: Helicone with custom call headers

```ts
import {
  HeliconeOpenAIApiConfiguration,
  generateText,
  openai,
} from "modelfusion";

const text = await generateText(
  openai
    .ChatTextGenerator({
      api: new HeliconeOpenAIApiConfiguration({
        customCallHeaders: ({ functionId, callId }) => ({
          "Helicone-Property-FunctionId": functionId,
          "Helicone-Property-CallId": callId,
        }),
      }),
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxGenerationTokens: 500,
    })
    .withTextPrompt(),

  "Write a short story about a robot learning to love",

  { functionId: "example-function" }
);
```
