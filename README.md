# ModelFusion

> ### Build AI applications, chatbots, and agents with JavaScript and TypeScript.

[![NPM Version](https://img.shields.io/npm/v/modelfusion?color=33cd56&logo=npm)](https://www.npmjs.com/package/modelfusion)
[![MIT License](https://img.shields.io/github/license/lgrammel/modelfusion)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-modelfusion.dev-blue)](https://modelfusion.dev)
[![Discord](https://discordapp.com/api/guilds/1136309340740006029/widget.png?style=shield)](https://discord.gg/GqCwYZATem)
[![Created by Lars Grammel](https://img.shields.io/badge/created%20by-@lgrammel-4BBAAB.svg)](https://twitter.com/lgrammel)

[Introduction](#introduction) | [Quick Install](#quick-install) | [Usage](#usage-examples) | [Features](#features) | [Integrations](#integrations) | [Documentation](#documentation) | [Examples](#more-examples) | [modelfusion.dev](https://modelfusion.dev)

> [!NOTE]
> ModelFusion is in its initial development phase. Until version 1.0 there may be breaking changes, because I am still exploring the API design. Feedback and suggestions are welcome.

## Introduction

ModelFusion is a library for building AI apps, chatbots, and agents. It provides abstractions for AI models, vector indices, and tools.

- **Type inference and validation**: ModelFusion uses TypeScript and [Zod](https://github.com/colinhacks/zod) to infer types wherever possible and to validate model responses.
- **Flexibility and control**: AI application development can be complex and unique to each project. With ModelFusion, you have complete control over the prompts and model settings, and you can access the raw responses from the models quickly to build what you need.
- **No chains and predefined prompts**: Use the concepts provided by JavaScript (variables, functions, etc.) and explicit prompts to build applications you can easily understand and control. Not black magic.
- **More than LLMs**: ModelFusion supports other models, e.g., text-to-image and voice-to-text, to help you build rich AI applications that go beyond just text.
- **Integrated support features**: Essential features like logging, retries, throttling, tracing, and error handling are built-in, helping you focus more on building your application.

## Quick Install

```sh
npm install modelfusion
```

You need to install `zod` and a matching version of `zod-to-json-schema` (peer dependencies):

```sh
npm install zod zod-to-json-schema
```

## Usage Examples

You can provide API keys for the different [integrations](https://modelfusion.dev/integration/model-provider/) using environment variables (e.g., `OPENAI_API_KEY`) or pass them into the model constructors as options.

### [Generate Text](https://modelfusion.dev/guide/function/generate-text)

Generate text using a language model and a prompt.
You can stream the text if it is supported by the model.
You can use [prompt mappings](https://modelfusion.dev/guide/function/generate-text/prompt-mapping) to change the prompt format of a model.

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
    OpenAIChatMessage.system("You are a story writer."),
    OpenAIChatMessage.user("Write a story about a robot learning to love"),
  ]
);

for await (const textFragment of textStream) {
  process.stdout.write(textFragment);
}
```

#### Prompt Mapping

[Prompt mapping](https://modelfusion.dev/guide/function/generate-text/prompt-mapping) lets you use higher level prompt structures (such as instruction or chat prompts) for different models.

```ts
const text = await generateText(
  new LlamaCppTextGenerationModel({
    contextWindowSize: 4096, // Llama 2 context window size
    nPredict: 1000,
  }).mapPrompt(InstructionToLlama2PromptMapping()),
  {
    system: "You are a story writer.",
    instruction: "Write a short story about a robot learning to love.",
  }
);
```

```ts
const textStream = await streamText(
  new OpenAIChatModel({
    model: "gpt-3.5-turbo",
  }).mapPrompt(ChatToOpenAIChatPromptMapping()),
  [
    { system: "You are a celebrated poet." },
    { user: "Write a short story about a robot learning to love." },
    { ai: "Once upon a time, there was a robot who learned to love." },
    { user: "That's a great start!" },
  ]
);
```

#### Metadata and original responses

ModelFusion model functions return rich results that include the original response and metadata when you set the `fullResponse` option to `true`.

```ts
// access the full response and the metadata:
// the response type is specific to the model that's being used
const { response, metadata } = await generateText(
  new OpenAITextGenerationModel({
    model: "text-davinci-003",
    maxTokens: 1000,
    n: 2, // generate 2 completions
  }),
  "Write a short story about a robot learning to love:\n\n",
  { fullResponse: true }
);

for (const choice of response.choices) {
  console.log(choice.text);
}

console.log(`Duration: ${metadata.durationInMs}ms`);
```

### [Generate JSON](https://modelfusion.dev/guide/function/generate-json)

Generate JSON value that matches a schema.

```ts
const value = await generateJson(
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

### [Generate JSON or Text](https://modelfusion.dev/guide/function/generate-json-or-text)

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

### [Tools](https://modelfusion.dev/guide/tools)

Tools are functions that can be executed by an AI model. They are useful for building chatbots and agents.

#### Create Tool

A tool is a function with a name, a description, and a schema for the input parameters.

```ts
const calculator = new Tool({
  name: "calculator",
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

### [Transcribe Audio](https://modelfusion.dev/guide/function/transcribe-audio)

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

### [Generate Image](https://modelfusion.dev/guide/function/generate-image)

Generate a base64-encoded image from a prompt.

```ts
const image = await generateImage(
  new OpenAIImageGenerationModel({ size: "512x512" }),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

### [Embed Text](https://modelfusion.dev/guide/function/embed-text)

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

### [Tokenize Text](https://modelfusion.dev/guide/function/tokenize-text)

Split text into tokens and reconstruct the text from tokens.

```ts
const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await countTokens(tokenizer, text);

const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```

### [Upserting and Retrieving Text Chunks from Vector Indices](https://modelfusion.dev/guide/text-chunks)

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
  chunks: texts.map((text) => ({ text })),
});

// retrieve text chunks from the vector index - usually done at query time:
const { chunks } = await retrieveTextChunks(
  new SimilarTextChunksFromVectorIndexRetriever({
    vectorIndex,
    embeddingModel,
    maxResults: 3,
    similarityThreshold: 0.8,
  }),
  "rainbow and water droplets"
);
```

## Features

- [Model Functions](https://modelfusion.dev/guide/function/)
  - [Generate and stream text](https://modelfusion.dev/guide/function/generate-text)
  - [Generate JSON](https://modelfusion.dev/guide/function/generate-json)
  - [Generate JSON or text](https://modelfusion.dev/guide/function/generate-json-or-text)
  - [Embed Text](https://modelfusion.dev/guide/function/embed-text)
  - [Tokenize Text](https://modelfusion.dev/guide/function/tokenize-text)
  - [Transcribe Audio](https://modelfusion.dev/guide/function/transcribe-audio)
  - [Generate images](https://modelfusion.dev/guide/function/generate-image)
- Summarize text
- [Tools](https://modelfusion.dev/guide/tools)
- [Text Chunks](https://modelfusion.dev/guide/text-chunk/)
  - [Split Text](https://modelfusion.dev/guide/text-chunk/split)
- [Run abstraction](https://modelfusion.dev/guide/run/)
  - [Abort signals](https://modelfusion.dev/guide/run/abort)
  - [Cost calculation](https://modelfusion.dev/guide/run/cost-calculation)
  - Call recording
- Utilities
  - [Retry strategies](https://modelfusion.dev/guide/util/retry)
  - [Throttling strategies](https://modelfusion.dev/guide/util/throttle)
  - Error handling

## Integrations

### Model Providers

|                                                                                       | [OpenAI](https://modelfusion.dev/integration/model-provider/openai) | [Cohere](https://modelfusion.dev/integration/model-provider/cohere) | [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp) | [Hugging Face](https://modelfusion.dev/integration/model-provider/huggingface) | [Stability AI](https://modelfusion.dev/integration/model-provider/stability) | [Automatic1111](https://modelfusion.dev/integration/model-provider/automatic1111) |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Hosting                                                                               | cloud                                                               | cloud                                                               | server (local)                                                           | cloud                                                                          | cloud                                                                        | server (local)                                                                    |
| [Generate text](https://modelfusion.dev/guide/function/generate-text)                 | ✅                                                                  | ✅                                                                  | ✅                                                                       | ✅                                                                             |                                                                              |                                                                                   |
| [Stream text](https://modelfusion.dev/guide/function/generate-text)                   | ✅                                                                  | ✅                                                                  | ✅                                                                       |                                                                                |                                                                              |                                                                                   |
| [Generate JSON](https://modelfusion.dev/guide/function/generate-json)                 | chat models                                                         |                                                                     |                                                                          |                                                                                |                                                                              |                                                                                   |
| [Generate JSON or Text](https://modelfusion.dev/guide/function/generate-json-or-text) | chat models                                                         |                                                                     |                                                                          |                                                                                |                                                                              |                                                                                   |
| [Embed text](https://modelfusion.dev/guide/function/embed-text)                       | ✅                                                                  | ✅                                                                  | ✅                                                                       | ✅                                                                             |                                                                              |                                                                                   |
| [Tokenize text](https://modelfusion.dev/guide/function/tokenize-text)                 | full                                                                | full                                                                | basic                                                                    |                                                                                |                                                                              |                                                                                   |
| [Generate image](https://modelfusion.dev/guide/function/generate-image)               | ✅                                                                  |                                                                     |                                                                          |                                                                                | ✅                                                                           | ✅                                                                                |
| [Transcribe audio](https://modelfusion.dev/guide/function/transcribe-audio)           | ✅                                                                  |                                                                     |                                                                          |                                                                                |                                                                              |                                                                                   |
| [Cost calculation](https://modelfusion.dev/guide/run/cost-calculation)                | ✅                                                                  |                                                                     |                                                                          |                                                                                |                                                                              |                                                                                   |

### Vector Indices

- [Memory](https://modelfusion.dev/integration/vector-index/memory)
- [Pinecone](https://modelfusion.dev/integration/vector-index/pinecone)

### Observability

- [Helicone](https://modelfusion.dev/integration/observability/helicone)

### Prompt Formats

Use higher level prompts that are mapped into model specific prompt formats.

| Prompt Format | Instruction Prompt | Chat Prompt |
| ------------- | ------------------ | ----------- |
| OpenAI Chat   | ✅                 | ✅          |
| Llama 2       | ✅                 | ✅          |
| Alpaca        | ✅                 | ❌          |
| Vicuna        | ❌                 | ✅          |
| Generic Text  | ✅                 | ✅          |

## Documentation

- [Guide](https://modelfusion.dev/guide)
- [Examples & Tutorials](https://modelfusion.dev/tutorial)
- [Integrations](https://modelfusion.dev/integration/model-provider)
- [API Reference](https://modelfusion.dev/api/modules)
- [Blog](https://modelfusion.dev/api/blog)

## More Examples

### [Basic Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic)

Examples for the individual functions and objects.

### [Chatbot (Terminal)](https://github.com/lgrammel/modelfusion/tree/main/examples/chatbot-terminal)

> _Terminal app_, _chat_, _llama.cpp_

### [Chatbot (Next.JS)](https://github.com/lgrammel/modelfusion/tree/main/examples/chatbot-next-js)

> _Next.js app_, _OpenAI GPT-3.5-turbo_, _streaming_, _abort handling_

A web chat with an AI assistant, implemented as a Next.js app.

### [Chat with PDF](https://github.com/lgrammel/modelfusion/tree/main/examples/pdf-chat-terminal)

> _terminal app_, _PDF parsing_, _in memory vector indices_, _retrieval augmented generation_, _hypothetical document embedding_

Ask questions about a PDF document and get answers from the document.

### [Image generator (Next.js)](https://github.com/lgrammel/modelfusion/tree/main/examples/image-generator-next-js)

> _Next.js app_, _Stability AI image generation_

Create an 19th century painting image for your input.

### [Voice recording and transcription (Next.js)](https://github.com/lgrammel/modelfusion/tree/main/examples/voice-recording-next-js)

> _Next.js app_, _OpenAI Whisper_

Record audio with push-to-talk and transcribe it using Whisper, implemented as a Next.js app. The app shows a list of the transcriptions.

### [BabyAGI Agent](https://github.com/lgrammel/modelfusion/tree/main/examples/babyagi-agent)

> _terminal app_, _agent_, _BabyAGI_

TypeScript implementation of the BabyAGI classic and BabyBeeAGI.

### [Wikipedia Agent](https://github.com/lgrammel/modelfusion/tree/main/examples/wikipedia-agent)

> _terminal app_, _ReAct agent_, _GPT-4_, _OpenAI functions_, _tools_

Get answers to questions from Wikipedia, e.g. "Who was born first, Einstein or Picasso?"

### [Middle school math agent](https://github.com/lgrammel/modelfusion/tree/main/examples/middle-school-math-agent)

> _terminal app_, _agent_, _tools_, _GPT-4_

Small agent that solves middle school math problems. It uses a calculator tool to solve the problems.

### [PDF to Tweet](https://github.com/lgrammel/modelfusion/tree/main/examples/pdf-to-tweet)

> _terminal app_, _PDF parsing_, _recursive information extraction_, _in memory vector index, \_style example retrieval_, _OpenAI GPT-4_, _cost calculation_

Extracts information about a topic from a PDF and writes a tweet in your own style about it.
