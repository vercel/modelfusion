# ai-utils.js

> ### A TypeScript-first library for building AI apps, chatbots, and agents.

[![Created by Lars Grammel](https://img.shields.io/badge/created%20by-@lgrammel-4BBAAB.svg)](https://twitter.com/lgrammel)
[![NPM Version](https://img.shields.io/npm/v/ai-utils.js?color=33cd56&logo=npm)](https://www.npmjs.com/package/ai-utils.js)
[![MIT License](https://img.shields.io/github/license/lgrammel/ai-utils.js)](https://opensource.org/licenses/MIT)

[Introduction](#introduction) | [Quick Install](#quick-install) | [Usage](#usage-examples) | [Features](#features) | [Integrations](#integrations) | [Documentation](#documentation) | [Examples](#more-examples) | [ai-utils.dev](https://ai-utils.dev)

## Disclaimer

`ai-utils.js` is currently in its initial development phase. **Until version 0.1 there may be frequent breaking changes.**

## Introduction

`ai-utils.js` is a TypeScript-first library for building AI apps, chatbots, and agents. It provides abstractions for working with AI models, vector indices, and tools. It was designed with the following goals in mind:

- **Provide type inference and validation**: `ai-utils.js` uses TypeScript and [Zod](https://github.com/colinhacks/zod) to infer types whereever possible and to validate AI responses.
- **Flexibility**: AI application development can be complex and unique to each project. With `ai-utils.js`, you have complete control over the prompts, the model settings, and the control flow of your application.
- **Integrate support features**: Essential features like logging, retries, throttling, and error handling are integrated and easily configurable.

## Quick Install

```sh
npm install ai-utils.js
```

You need to install `zod` and a matching version of `zod-to-json-schema` (peer dependencies):

```sh
npm install zod zod-to-json-schema
```

## Usage Examples

You can provide API keys for the different [integrations](https://ai-utils.dev/integration/model-provider/) using environment variables (e.g., `OPENAI_API_KEY`) or pass them into the model constructors as options.

### [Generate Text](https://ai-utils.dev/guide/function/generate-text)

Generate text using a language model and a prompt. You can stream the text if it is supported by the model.

#### generateText

```ts
const text = await generateText(
  new OpenAITextGenerationModel({ model: "text-davinci-003" }),
  "Write a short story about a robot learning to love:\n\n"
);
```

#### streamText

```ts
const textStream = await streamText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
  [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user("A robot learning to love"),
  ]
);

for await (const textFragment of textStream) {
  process.stdout.write(textFragment);
}
```

### [Generate JSON](https://ai-utils.dev/guide/function/generate-json)

Generate JSON that matches a schema.

```ts
const json = await generateJson(
  new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0,
    maxTokens: 50,
  }),
  {
    name: "sentiment" as const,
    description: "Write the sentiment analysis",
    schema: z.object({
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    }),
  },
  OpenAIChatFunctionPrompt.forSchemaCurried([
    OpenAIChatMessage.system(
      "You are a sentiment evaluator. " +
        "Analyze the sentiment of the following product review:"
    ),
    OpenAIChatMessage.user(
      "After I opened the package, I was met by a very unpleasant smell " +
        "that did not disappear even after washing. Never again!"
    ),
  ])
);
```

### [Generate JSON or Text](https://ai-utils.dev/guide/function/generate-json-or-text)

Generate JSON (or text as a fallback) using a prompt and multiple schemas.
It either matches one of the schemas or is text reponse.

```ts
const { schema, value, text } = await generateJsonOrText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
  [
    {
      name: "getCurrentWeather" as const, // mark 'as const' for type inference
      description: "Get the current weather in a given location",
      schema: z.object({
        location: z
          .string()
          .describe("The city and state, e.g. San Francisco, CA"),
        unit: z.enum(["celsius", "fahrenheit"]).optional(),
      }),
    },
    {
      name: "getContactInformation" as const,
      description: "Get the contact information for a given person",
      schema: z.object({
        name: z.string().describe("The name of the person"),
      }),
    },
  ],
  OpenAIChatFunctionPrompt.forSchemasCurried([OpenAIChatMessage.user(query)])
);
```

### [Tools](https://ai-utils.dev/guide/tools)

Tools are functions that can be executed by an AI model. They are useful for building chatbots and agents.

#### Create Tool

A tool is a function with a name, a description, and a schema for the input parameters.

```ts
const calculator = new Tool({
  name: "calculator" as const, // mark 'as const' for type inference
  description: "Execute a calculation",

  inputSchema: z.object({
    a: z.number().describe("The first number."),
    b: z.number().describe("The second number."),
    operator: z.enum(["+", "-", "*", "/"]).describe("The operator."),
  }),

  execute: async ({ a, b, operator }) => {
    switch (operator) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return a / b;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  },
});
```

#### useTool

The model determines the parameters for the tool from the prompt and then executes it.

```ts
const { tool, parameters, result } = await useTool(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  calculator,
  OpenAIChatFunctionPrompt.forToolCurried([
    OpenAIChatMessage.user("What's fourteen times twelve?"),
  ])
);
```

#### useToolOrGenerateText

The model determines which tool to use and its parameters from the prompt and then executes it.
Text is generated as a fallback.

```ts
const { tool, parameters, result, text } = await useToolOrGenerateText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  [calculator /* ... */],
  OpenAIChatFunctionPrompt.forToolsCurried([
    OpenAIChatMessage.user("What's fourteen times twelve?"),
  ])
);
```

### [Transcribe Audio](https://ai-utils.dev/guide/function/transcribe-audio)

Turn audio (voice) into text.

```ts
const transcription = await transcribe(
  new OpenAITranscriptionModel({ model: "whisper-1" }),
  {
    type: "mp3",
    data: await fs.promises.readFile("data/test.mp3"),
  }
);
```

### [Generate Image](https://ai-utils.dev/guide/function/generate-image)

Generate an image from a prompt.

```ts
const imageBase64 = await generateImage(
  new OpenAIImageGenerationModel({ size: "512x512" }),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

### [Embed Text](https://ai-utils.dev/guide/function/embed-text)

Create embeddings for text. Embeddings are vectors that represent the meaning of the text.

```ts
const embeddings = await embedTexts(
  new OpenAITextEmbeddingModel({ model: "text-embedding-ada-002" }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]
);
```

### [Tokenize Text](https://ai-utils.dev/guide/function/tokenize-text)

Split text into tokens and reconstruct the text from tokens.

```ts
const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await countTokens(tokenizer, text);

const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```

### [Upserting and Retrieving Text Chunks from Vector Indices](https://ai-utils.dev/guide/text-chunks)

```ts
const texts = [
  "A rainbow is an optical phenomenon that can occur under certain meteorological conditions.",
  "It is caused by refraction, internal reflection and dispersion of light in water droplets resulting in a continuous spectrum of light appearing in the sky.",
  // ...
];

const vectorIndex = new MemoryVectorIndex<TextChunk>();
const embeddingModel = new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
});

// update an index - usually done as part of an ingestion process:
await upsertTextChunks({
  vectorIndex,
  embeddingModel,
  chunks: texts.map((text) => ({ content: text })),
});

// retrieve text chunks from the vector index - usually done at query time:
const results = await retrieveTextChunks(
  new VectorIndexSimilarTextChunkRetriever({
    vectorIndex,
    embeddingModel,
    maxResults: 3,
    similarityThreshold: 0.8,
  }),
  "rainbow and water droplets"
);
```

## Features

- [Model Functions](https://ai-utils.dev/guide/function/)
  - [Generate and stream text](https://ai-utils.dev/guide/function/generate-text)
  - [Generate JSON](https://ai-utils.dev/guide/function/generate-json)
  - [Generate JSON or text](https://ai-utils.dev/guide/function/generate-json-or-text)
  - [Embed Text](https://ai-utils.dev/guide/function/embed-text)
  - [Tokenize Text](https://ai-utils.dev/guide/function/tokenize-text)
  - [Transcribe Audio](https://ai-utils.dev/guide/function/transcribe-audio)
  - [Generate images](https://ai-utils.dev/guide/function/generate-image)
- Summarize text
- Split text
- [Tools](https://ai-utils.dev/guide/tools)
- [Text Chunks](https://ai-utils.dev/guide/text-chunks)
- [Run abstraction](https://ai-utils.dev/guide/run/)
  - [Abort signals](https://ai-utils.dev/guide/run/abort)
  - [Cost calculation](https://ai-utils.dev/guide/run/cost-calculation)
  - Call recording
- Utilities
  - [Retry strategies](https://ai-utils.dev/guide/util/retry)
  - [Throttling strategies](https://ai-utils.dev/guide/util/throttle)
  - Error handling

## Integrations

### Model Providers

|                                                                                    | [OpenAI](https://ai-utils.dev/integration/model-provider/openai) | [Cohere](https://ai-utils.dev/integration/model-provider/cohere) | [Llama.cpp](https://ai-utils.dev/integration/model-provider/llamacpp) | [Hugging Face](https://ai-utils.dev/integration/model-provider/huggingface) | [Stability AI](https://ai-utils.dev/integration/model-provider/stability) | [Automatic1111](https://ai-utils.dev/integration/model-provider/automatic1111) |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Hosting                                                                            | cloud                                                            | cloud                                                            | server (local)                                                        | cloud                                                                       | cloud                                                                     | server (local)                                                                 |
| [Generate text](https://ai-utils.dev/guide/function/generate-text)                 | ✅                                                               | ✅                                                               | ✅                                                                    | ✅                                                                          |                                                                           |                                                                                |
| [Stream text](https://ai-utils.dev/guide/function/generate-text)                   | ✅                                                               | ✅                                                               | ✅                                                                    |                                                                             |                                                                           |                                                                                |
| [Generate JSON](https://ai-utils.dev/guide/function/generate-json)                 | chat models                                                      |                                                                  |                                                                       |                                                                             |                                                                           |                                                                                |
| [Generate JSON or Text](https://ai-utils.dev/guide/function/generate-json-or-text) | chat models                                                      |                                                                  |                                                                       |                                                                             |                                                                           |                                                                                |
| [Embed text](https://ai-utils.dev/guide/function/embed-text)                       | ✅                                                               | ✅                                                               | ✅                                                                    |                                                                             |                                                                           |                                                                                |
| [Tokenize text](https://ai-utils.dev/guide/function/tokenize-text)                 | full                                                             | full                                                             | basic                                                                 |                                                                             |                                                                           |                                                                                |
| [Generate image](https://ai-utils.dev/guide/function/generate-image)               | ✅                                                               |                                                                  |                                                                       |                                                                             | ✅                                                                        | ✅                                                                             |
| [Transcribe audio](https://ai-utils.dev/guide/function/transcribe-audio)           | ✅                                                               |                                                                  |                                                                       |                                                                             |                                                                           |                                                                                |
| [Cost calculation](https://ai-utils.dev/guide/run/cost-calculation)                | ✅                                                               |                                                                  |                                                                       |                                                                             |                                                                           |                                                                                |

### Vector Indices

- [Memory](https://ai-utils.dev/integration/vector-index/memory)
- [Pinecone](https://ai-utils.dev/integration/vector-index/pinecone)

## Documentation

- [Guide](https://ai-utils.dev/guide)
- [Examples & Tutorials](https://ai-utils.dev/tutorial)
- [Integrations](https://ai-utils.dev/integration/model-provider)
- [API Reference](https://ai-utils.dev/api/modules)

## More Examples

### [Basic Examples](https://github.com/lgrammel/ai-utils.js/tree/main/examples/basic)

Examples for the individual functions and objects.

### [PDF to Tweet](https://github.com/lgrammel/ai-utils.js/tree/main/examples/pdf-to-tweet)

> _terminal app_, _PDF parsing_, _recursive information extraction_, _in memory vector index, \_style example retrieval_, _OpenAI GPT-4_, _cost calculation_

Extracts information about a topic from a PDF and writes a tweet in your own style about it.

### [AI Chat (Next.JS)](https://github.com/lgrammel/ai-utils.js/tree/main/examples/ai-chat-next-js)

> _Next.js app_, _OpenAI GPT-3.5-turbo_, _streaming_, _abort handling_

A basic web chat with an AI assistant, implemented as a Next.js app.

### [Image generator (Next.js)](https://github.com/lgrammel/ai-utils.js/tree/main/examples/image-generator-next-js)

> _Next.js app_, _Stability AI image generation_

Create an 19th century painting image for your input.

### [Voice recording and transcription (Next.js)](https://github.com/lgrammel/ai-utils.js/tree/main/examples/voice-recording-next-js)

> _Next.js app_, _OpenAI Whisper_

Record audio with push-to-talk and transcribe it using Whisper, implemented as a Next.js app. The app shows a list of the transcriptions.

### [BabyAGI Classic](https://github.com/lgrammel/ai-utils.js/tree/main/examples/baby-agi)

> _terminal app_, _agent_, _BabyAGI_, _OpenAI text-davinci-003_

TypeScript implementation of the classic [BabyAGI](https://github.com/yoheinakajima/babyagi/blob/main/classic/babyagi.py) by [@yoheinakajima](https://twitter.com/yoheinakajima) without embeddings.

### [Middle school math](https://github.com/lgrammel/ai-utils.js/tree/main/examples/middle-school-math)

> _terminal app_, _agent_, _tools_, _GPT-4_

Small agent that solves middle school math problems. It uses a calculator tool to solve the problems.

### [Terminal Chat (llama.cpp)](https://github.com/lgrammel/ai-utils.js/tree/main/examples/terminal-chat-llamacpp)

> _Terminal app_, _chat_, _llama.cpp_

A terminal chat with a Llama.cpp server backend.
