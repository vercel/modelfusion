---
sidebar_position: 2
title: OpenAI
---

# OpenAI

## Setup

1. You can sign up for a developer account at [OpenAI](https://platform.openai.com/overview). You can then [create an API key](https://platform.openai.com/account/api-keys) for accessing the OpenAI API.
1. The API key can be configured as an environment variable (`OPENAI_API_KEY`) or passed in as an option into the model constructor.

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/openai)

### Generate Text (Completion)

[OpenAICompletionModel API](/api/classes/OpenAICompletionModel)

```ts
import { openai, generateText } from "modelfusion";

const text = await generateText({
  model: openai.CompletionTextGenerator({
    model: "gpt-3.5-turbo-instruct",
    temperature: 0.7,
    maxGenerationTokens: 500,
  }),

  prompt: "Write a short story about a robot learning to love:\n\n",
});
```

### Generate Text (Chat)

[OpenAIChatModel API](/api/classes/OpenAIChatModel)

The OpenAI chat models include GPT-3.5-turbo and GPT-4.

```ts
import { openai, generateText } from "modelfusion";

const text = await generateText({
  model: openai
    .ChatTextGenerator({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxGenerationTokens: 500,
    })
    .withTextPrompt(),

  prompt: "Write a short story about a robot learning to love:",
});
```

:::note
You can use your fine-tuned `gpt-3.5-turbo` models similarly to the base models. Learn more about [OpenAI fine-tuning](https://platform.openai.com/docs/guides/fine-tuning).
:::

#### Using vision models

You can provide an image in the user message when you are using vision models such as `gpt-4-vision-preview`:

```ts
const text = await generateText({
  model: openai.ChatTextGenerator({ model: "gpt-4-vision-preview" }),
  prompt: [
    openai.ChatMessage.user([
      { type: "text", text: "Describe the image in detail:" },
      { type: "image", base64Image: image, mimeType: "image/png" },
    ]),
  ],
});
```

The tutorial "[Using OpenAI GPT-4 Turbo Vision](/integration/model-provider/openai/using-gpt-4-vision)" provides more details.

#### Using raw messages

The `openai.ChatMessage` functions are convenience helpers for creating a prompt. You can also use a raw OpenAI message list:

```ts
const text = await generateText({
  model: openai.ChatTextGenerator({
    model: "gpt-3.5-turbo",
  }),
  prompt: [
    {
      role: "system",
      content: "You are a story writer.",
    },
    {
      role: "user",
      content: "Write a short story about a robot learning to love",
    },
  ],
});
```

### Stream Text (Completion)

[OpenAICompletionModel API](/api/classes/OpenAICompletionModel)

```ts
import { OpenAICompletionModel, streamText } from "modelfusion";

const textStream = await streamText({
  model: openai.CompletionTextGenerator({
    model: "gpt-3.5-turbo-instruct",
    maxGenerationTokens: 1000,
  }),
  prompt: "Write a story about a robot learning to love",
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Stream Text (Chat)

[OpenAIChatModel API](/api/classes/OpenAIChatModel)

```ts
import { openai, streamText } from "modelfusion";

const textStream = await streamText({
  model: openai
    .ChatTextGenerator({
      model: "gpt-3.5-turbo",
      maxGenerationTokens: 1000,
    })
    .withTextPrompt(),

  prompt: "Write a story about a robot learning to love",
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Generate Structure

#### Chat Model (function call)

You can map the chat model to a `StructureGenerationModel` by using the `asFunctionCallStructureGenerationModel` method.

The mapped model will use the [OpenAI GPT function calling API](https://platform.openai.com/docs/guides/gpt/function-calling). It provides a single function specification and instructs the model to provide parameters for calling the function. The result is returned as parsed JSON.

[OpenAIChatModel API](/api/classes/OpenAIChatModel) |

```ts
import { openai, zodSchema, generateStructure } from "modelfusion";
import { z } from "zod";

const sentiment = await generateStructure({
  model: openai
    .ChatTextGenerator({
      model: "gpt-3.5-turbo",
      temperature: 0,
      maxGenerationTokens: 50,
    })
    .asFunctionCallStructureGenerationModel({
      fnName: "sentiment",
      fnDescription: "Write the sentiment analysis",
    })
    .withInstructionPrompt(),

  schema: zodSchema(
    z.object({
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    })
  ),

  prompt: {
    system:
      "You are a sentiment evaluator. " +
      "Analyze the sentiment of the following product review:",
    instruction:
      "After I opened the package, I was met by a very unpleasant smell " +
      "that did not disappear even after washing. Never again!",
  },
});
```

### Embed Text

[OpenAITextEmbeddingModel API](/api/classes/OpenAITextEmbeddingModel)

```ts
import { openai, embedMany } from "modelfusion";

const embeddings = await embedMany({
  model: openai.TextEmbedder({ model: "text-embedding-ada-002" }),
  values: [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ],
});
```

### Tokenize Text

[TikTokenTokenizer API](/api/classes/TikTokenTokenizer)

```ts
import { openai, countTokens } from "modelfusion";

const tokenizer = openai.Tokenizer({ model: "gpt-4" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await countTokens(tokenizer, text);
const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```

### Generate Transcription

[OpenAITranscriptionModel API](/api/classes/OpenAITranscriptionModel)

```ts
import fs from "node:fs";
import { openai, generateTranscription } from "modelfusion";

const data = await fs.promises.readFile("data/test.mp3");

const transcription = await generateTranscription({
  model: openai.Transcriber({ model: "whisper-1" }),
  data: { type: "mp3", data },
});
```

### Generate Image

OpenAI provides a model called DALL-E that can generate images from text descriptions.

[OpenAIImageGenerationModel API](/api/classes/OpenAIImageGenerationModel)

```ts
import { openai, generateImage } from "modelfusion";

const image = await generateImage({
  model: openai.ImageGenerator({
    model: "dall-e-3",
    size: "1024x1024",
  }),
  prompt:
    "the wicked witch of the west in the style of early 19th century painting",
});
```

### Generate Speech

```ts
import { openai, generateSpeech } from "modelfusion";

const speech = await generateSpeech({
  model: openai.SpeechGenerator({
    model: "tts-1",
    voice: "onyx",
  }),
  text:
    "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
    "as The Rolling Stones unveil 'Hackney Diamonds,' their first collection of " +
    "fresh tunes in nearly twenty years, featuring the illustrious Lady Gaga, the " +
    "magical Stevie Wonder, and the final beats from the late Charlie Watts.",
});

const path = `./openai-speech-example.mp3`;
fs.writeFileSync(path, speech);
```

## Configuration

### API Configuration (OpenAI)

[OpenAI API Configuration](/api/classes/OpenAIApiConfiguration)

```ts
const api = openai.Api({
  apiKey: "my-api-key", // optional; default: process.env.OPENAI_API_KEY
  // ...
});

const model = openai.ChatTextGenerator({
  api,
  // ...
});
```

### API Configuration (Azure)

[Azure OpenAI API Configuration](/api/classes/AzureOpenAIApiConfiguration)

This configuration is for using [OpenAI with Azure](https://azure.microsoft.com/en-us/products/ai-services/openai-service).

You need to configure the API as `AZURE_OPENAI_API_KEY` if you want to use it as an environment variable and configure the API as follows:

```ts
openai.ChatTextGenerator({
  api: openai.AzureApi({
    // apiKey: automatically uses process.env.AZURE_OPENAI_API_KEY,
    resourceName: "my-resource-name",
    deploymentId: "my-deployment-id",
    apiVersion: "my-api-version",
  }),
  // ...
});
```
