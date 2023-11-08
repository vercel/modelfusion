---
sidebar_position: 2
title: OpenAI
---

# OpenAI

## Setup

1. You can sign up for a developer account at [OpenAI](https://platform.openai.com/overview). You can then [create an API key](https://platform.openai.com/account/api-keys) for accessing the OpenAI API.
1. The API key can be configured as an environment variable (`OPENAI_API_KEY`) or passed in as an option into the model constructor.

## Configuration

### API Configuration (OpenAI)

[OpenAI API Configuration](/api/classes/OpenAIApiConfiguration)

```ts
const api = new OpenAIApiConfiguration({
  apiKey: "my-api-key", // optional; default: process.env.OPENAI_API_KEY
  // ...
});

const model = new OpenAIChatModel({
  api,
  // ...
});
```

### API Configuration (Azure)

[Azure OpenAI API Configuration](/api/classes/AzureOpenAIApiConfiguration)

This configuration is for using [OpenAI with Azure](https://azure.microsoft.com/en-us/products/ai-services/openai-service).

You need to configure the API as `AZURE_OPENAI_API_KEY` if you want to use it as an environment variable and configure the API as follows:

```ts
new OpenAIChatModel({
  api: new AzureOpenAIApiConfiguration({
    // apiKey: automatically uses process.env.AZURE_OPENAI_API_KEY,
    resourceName: "my-resource-name",
    deploymentId: "my-deployment-id",
    apiVersion: "my-api-version",
  }),
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/openai)

### Generate Text

#### Text Model

[OpenAICompletionModel API](/api/classes/OpenAICompletionModel)

```ts
import { OpenAICompletionModel, generateText } from "modelfusion";

const text = await generateText(
  new OpenAICompletionModel({
    model: "gpt-3.5-turbo-instruct",
    temperature: 0.7,
    maxCompletionTokens: 500,
  }),
  "Write a short story about a robot learning to love:\n\n"
);
```

:::note
You can use your fine-tuned `davinci-002` and `babbage-002` models similarly to the base models. Learn more about [OpenAI fine-tuning](https://platform.openai.com/docs/guides/fine-tuning).
:::

#### Chat Model

The OpenAI chat models include GPT-3.5-turbo and GPT-4.

[OpenAIChatModel API](/api/classes/OpenAIChatModel)

```ts
import { OpenAIChatMessage, OpenAIChatModel, generateText } from "modelfusion";

const text = await generateText(
  new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxCompletionTokens: 500,
  }),
  [
    OpenAIChatMessage.system(
      "Write a short story about a robot learning to love:"
    ),
  ]
);
```

:::note
You can use your fine-tuned `gpt-3.5-turbo` models similarly to the base models. Learn more about [OpenAI fine-tuning](https://platform.openai.com/docs/guides/fine-tuning).
:::

### Stream Text

#### Text Model

[OpenAICompletionModel API](/api/classes/OpenAICompletionModel)

```ts
import { OpenAICompletionModel, streamText } from "modelfusion";

const textStream = await streamText(
  new OpenAICompletionModel({
    model: "gpt-3.5-turbo-instruct",
    maxCompletionTokens: 1000,
  }),
  "You are a story writer. Write a story about a robot learning to love"
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

#### Chat Model

[OpenAIChatModel API](/api/classes/OpenAIChatModel)

```ts
import { OpenAIChatMessage, OpenAIChatModel, streamText } from "modelfusion";

const textStream = await streamText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxCompletionTokens: 1000 }),
  [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user("A robot learning to love"),
  ]
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Generate Structure

#### Chat Model

Structure generation uses the [OpenAI GPT function calling API](https://platform.openai.com/docs/guides/gpt/function-calling). It provides a single function specification and instructs the model to provide parameters for calling the function. The result is returned as parsed JSON.

[OpenAIChatModel API](/api/classes/OpenAIChatModel) |

```ts
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodStructureDefinition,
  generateStructure,
} from "modelfusion";
import { z } from "zod";

const sentiment = await generateStructure(
  new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0,
    maxCompletionTokens: 50,
  }),
  new ZodStructureDefinition({
    name: "sentiment" as const,
    description: "Write the sentiment analysis",
    schema: z.object({
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    }),
  }),
  [
    OpenAIChatMessage.system(
      "You are a sentiment evaluator. " +
        "Analyze the sentiment of the following product review:"
    ),
    OpenAIChatMessage.user(
      "After I opened the package, I was met by a very unpleasant smell " +
        "that did not disappear even after washing. Never again!"
    ),
  ]
);
```

### Generate Structure or Text

#### Chat Model

Structure generation uses the [OpenAI GPT function calling API](https://platform.openai.com/docs/guides/gpt/function-calling). It provides multiple function specifications and instructs the model to provide parameters for calling one of the functions, or to just return text (`auto`). The result is returned as parsed JSON.

[OpenAIChatModel API](/api/classes/OpenAIChatModel) |

```ts
const { structure, value, text } = await generateStructureOrText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxCompletionTokens: 1000 }),
  [
    new ZodStructureDefinition({
      name: "getCurrentWeather" as const, // mark 'as const' for type inference
      description: "Get the current weather in a given location",
      schema: z.object({
        location: z
          .string()
          .describe("The city and state, e.g. San Francisco, CA"),
        unit: z.enum(["celsius", "fahrenheit"]).optional(),
      }),
    }),
    new ZodStructureDefinition({
      name: "getContactInformation" as const,
      description: "Get the contact information for a given person",
      schema: z.object({
        name: z.string().describe("The name of the person"),
      }),
    }),
  ],
  [OpenAIChatMessage.user(query)]
);
```

The result contains:

- `structure`: The name of the structure that was matched or `null` if text was generated.
- `value`: The value of the structure that was matched or `null` if text was generated.
- `text`: The generated text. Optional when a structure was matched.

```ts
switch (structure) {
  case "getCurrentWeather": {
    const { location, unit } = value;
    console.log("getCurrentWeather", location, unit);
    break;
  }

  case "getContactInformation": {
    const { name } = value;
    console.log("getContactInformation", name);
    break;
  }

  case null: {
    console.log("No function call. Generated text: ", text);
  }
}
```

### Text Embedding

[OpenAITextEmbeddingModel API](/api/classes/OpenAITextEmbeddingModel)

```ts
import { OpenAITextEmbeddingModel, embedMany } from "modelfusion";

const embeddings = await embedMany(
  new OpenAITextEmbeddingModel({ model: "text-embedding-ada-002" }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]
);
```

### Tokenize Text

[TikTokenTokenizer API](/api/classes/TikTokenTokenizer)

```ts
import { TikTokenTokenizer, countTokens } from "modelfusion";

const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });

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
import { OpenAITranscriptionModel, generateTranscription } from "modelfusion";

const data = await fs.promises.readFile("data/test.mp3");

const transcription = await generateTranscription(
  new OpenAITranscriptionModel({ model: "whisper-1" }),
  {
    type: "mp3",
    data,
  }
);
```

### Generate Image

OpenAI provides a model called DALL-E that can generate images from text descriptions.

[OpenAIImageGenerationModel API](/api/classes/OpenAIImageGenerationModel)

```ts
import { OpenAIImageGenerationModel, generateImage } from "modelfusion";

const image = await generateImage(
  new OpenAIImageGenerationModel({
    model: "dall-e-3",
    size: "1024x1024",
  }),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

### Generate Speech

```ts
import { OpenAISpeechModel, generateSpeech } from "modelfusion";

const speech = await generateSpeech(
  new OpenAISpeechModel({
    model: "tts-1",
    voice: "onyx",
  }),
  "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
    "as The Rolling Stones unveil 'Hackney Diamonds,' their first collection of " +
    "fresh tunes in nearly twenty years, featuring the illustrious Lady Gaga, the " +
    "magical Stevie Wonder, and the final beats from the late Charlie Watts."
);

const path = `./openai-speech-example.mp3`;
fs.writeFileSync(path, speech);
```

## Prompt Formats

### OpenAI Chat Prompt format

#### Instruction prompt

You an use [mapInstructionPromptToOpenAIChatFormat()](/api/modules#mapinstructionprompttoopenaichatformat) to use [instruction prompts](/api/modules#instructionprompt) with OpenAI chat models. It is available as a shorthand method:

```ts
const textStream = await streamText(
  new OpenAIChatModel({
    // ...
  }).withInstructionPrompt(),
  {
    system: "You are a celebrated poet.",
    instruction: "Write a short story about a robot learning to love.",
  }
);
```

#### Chat prompt

You an use [mapChatPromptToOpenAIChatFormat()](/api/modules#mapchatprompttoopenaichatformat) to use [chat prompts](/api/modules#chatprompt) with OpenAI chat models. It is available as a shorthand method:

```ts
const textStream = await streamText(
  new OpenAIChatModel({
    // ...
  }).withChatPrompt(),
  [
    { system: "You are a celebrated poet." },
    { user: "Write a short story about a robot learning to love." },
    { ai: "Once upon a time, there was a robot who learned to love." },
    { user: "That's a great start!" },
  ]
);
```
