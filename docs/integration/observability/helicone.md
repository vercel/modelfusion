---
sidebar_position: 2
title: Helicone
---

# Helicone

## Setup

You can get an API key from [Helicone](https://www.helicone.ai/).
You can explore the recorded calls on their platform.

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/observability/helicone/)

ModelFusion supports Helicone for [OpenAI text and chat models](/integration/model-provider/openai) in the proxy integration setup.
You can change the `baseUrl` of the OpenAI model and pass in the Helicone API key to enable Helicone.

### Example: OpenAI Chat

```ts
const { text } = await generateText(
  new OpenAIChatModel({
    // Change the baseUrl to the Helicone proxy:
    baseUrl: "https://oai.hconeai.com/v1",
    headers: {
      // Pass in your Helicone API key:
      "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
    },
    model: "gpt-3.5-turbo",
  })
  // ....
);
```
