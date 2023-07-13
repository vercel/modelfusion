---
sidebar_position: 2
title: OpenAI
---

# OpenAI

## Setup

1. You can sign up for a developer account at [OpenAI](https://platform.openai.com/overview). You can then [create an API key](https://platform.openai.com/account/api-keys) for accessing the OpenAI API.
1. The API key can be configured as an environment variable (`OPENAI_API_KEY`) or passed in as an option into the model constructor.

## Usage

[Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic/src/model-provider/openai)

### Generate Text

#### Text Model

[OpenAITextGenerationModel API](/api/classes/OpenAITextGenerationModel)

```ts
import { OpenAITextGenerationModel, generateText } from "ai-utils.js";

const text = await generateText(
  new OpenAITextGenerationModel({
    model: "text-davinci-003",
    temperature: 0.7,
    maxTokens: 500,
  }),
  "Write a short story about a robot learning to love:\n\n"
);
```

#### Chat Model

The OpenAI chat models include GPT-3.5-turbo and GPT-4.

[OpenAIChatModel API](/api/classes/OpenAIChatModel)

```ts
import { OpenAIChatMessage, OpenAIChatModel, generateText } from "ai-utils.js";

const text = await generateText(
  new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 500,
  }),
  [
    OpenAIChatMessage.system(
      "Write a short story about a robot learning to love:"
    ),
  ]
);
```

### Stream Text

#### Text Model

[OpenAITextGenerationModel API](/api/classes/OpenAITextGenerationModel)

```ts
import { OpenAITextGenerationModel, streamText } from "ai-utils.js";

const tokenStream = await streamText(
  new OpenAITextGenerationModel({
    model: "text-davinci-003",
    maxTokens: 1000,
  }),
  "You are a story writer. Write a story about a robot learning to love"
);

for await (const token of tokenStream) {
  process.stdout.write(token);
}
```

#### Chat Model

[OpenAIChatModel API](/api/classes/OpenAIChatModel)

```ts
import { OpenAIChatMessage, OpenAIChatModel, streamText } from "ai-utils.js";

const tokenStream = await streamText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
  [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user("A robot learning to love"),
  ]
);

for await (const token of tokenStream) {
  process.stdout.write(token);
}
```

### Generate JSON

#### Chat Model

JSON generation uses the [OpenAI GPT function calling API](https://platform.openai.com/docs/guides/gpt/function-calling). It provides a single function specification and instructs the model to provide parameters for calling the function. The result is returned as parsed JSON.

[OpenAIChatModel API](/api/classes/OpenAIChatModel)

```ts
import { OpenAIChatMessage, OpenAIChatModel, generateJson } from "ai-utils.js";

const json = await generateJson(
  new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 1000,
  }),
  [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user("A robot learning to love"),
  ],
  {
    name: "story",
    description: "Write the story",
    parameters: z.object({
      title: z.string().describe("The title of the story"),
      content: z.string().describe("The content of the story"),
    }),
  }
);
```

### Text Embedding

[OpenAITextEmbeddingModel API](/api/classes/OpenAITextEmbeddingModel)

```ts
import { OpenAITextEmbeddingModel, embedTexts } from "ai-utils.js";

const embeddings = await embedTexts(
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
import { TikTokenTokenizer, countTokens } from "ai-utils.js";

const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await countTokens(tokenizer, text);
const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```

### Transcribe

[OpenAITranscriptionModel API](/api/classes/OpenAITranscriptionModel)

```ts
import fs from "node:fs";
import { OpenAITranscriptionModel, transcribe } from "ai-utils.js";

const data = await fs.promises.readFile("data/test.mp3");

const transcription = await transcribe(
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
import { OpenAIImageGenerationModel, generateImage } from "ai-utils.js";

const imageBase64 = await generateImage(
  new OpenAIImageGenerationModel({ size: "512x512" }),
  "the wicked witch of the west in the style of early 19th century painting"
);
```
