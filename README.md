# ModelFusion

> ### The TypeScript library for building multi-modal AI applications.

[![NPM Version](https://img.shields.io/npm/v/modelfusion?color=33cd56&logo=npm)](https://www.npmjs.com/package/modelfusion)
[![MIT License](https://img.shields.io/github/license/lgrammel/modelfusion)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-modelfusion.dev-blue)](https://modelfusion.dev)
[![Discord](https://discordapp.com/api/guilds/1136309340740006029/widget.png?style=shield)](https://discord.gg/GqCwYZATem)
[![Created by Lars Grammel](https://img.shields.io/badge/created%20by-@lgrammel-4BBAAB.svg)](https://twitter.com/lgrammel)

[Introduction](#introduction) | [Quick Install](#quick-install) | [Usage](#usage-examples) | [Documentation](#documentation) | [Examples](#more-examples) | [Contributing](#contributing) | [modelfusion.dev](https://modelfusion.dev)

## Introduction

**ModelFusion** is a TypeScript library for building AI applications, chatbots, and agents.

- **Vendor-neutral**: ModelFusion is a non-commercial open source project that is community-driven. You can use it with any supported provider.
- **Multi-modal**: ModelFusion supports a wide range of models including text generation, image generation, vision, text-to-speech, speech-to-text, and embedding models.
- **Streaming**: ModelFusion supports streaming for many generation models, e.g. text streaming, structure streaming, and full duplex speech streaming.
- **Utility functions**: ModelFusion provides functionality for tools and tool usage, vector indices, and guards functions.
- **Type inference and validation**: ModelFusion infers TypeScript types wherever possible and to validates model responses.
- **Observability and logging**: ModelFusion provides an observer framework and out-of-the-box logging support.
- **Resilience and Robustness**: ModelFusion ensures seamless operation through automatic retries, throttling, and error handling mechanisms.
- **Server**: ModelFusion provides a Fastify plugin that exposes a ModelFusion flow as a REST endpoint that uses server-sent events.

## Quick Install

> [!NOTE]
> ModelFusion is in its initial development phase. The main API is now mostly stable, but until version 1.0 there may be breaking changes. Feedback and suggestions are welcome.

```sh
npm install modelfusion
```

Or use a template:

- [ModelFusion terminal app starter](https://github.com/lgrammel/modelfusion-terminal-app-starter)
- [Next.js, Vercel AI SDK, Llama.cpp & ModelFusion starter](https://github.com/lgrammel/modelfusion-llamacpp-nextjs-starter)
- [Next.js, Vercel AI SDK, Ollama & ModelFusion starter](https://github.com/lgrammel/modelfusion-ollama-nextjs-starter)

## Usage Examples

You can provide API keys for the different [integrations](https://modelfusion.dev/integration/model-provider/) using environment variables (e.g., `OPENAI_API_KEY`) or pass them into the model constructors as options.

### [Generate Text](https://modelfusion.dev/guide/function/generate-text)

Generate text using a language model and a prompt. You can stream the text if it is supported by the model. You can use images for multi-modal prompting if the model supports it (e.g. with [llama.cpp](https://modelfusion.dev/guide/)).
You can use [prompt formats](https://modelfusion.dev/guide/function/generate-text#prompt-format) to change the prompt format of a model.

#### generateText

```ts
const text = await generateText(
  openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),
  "Write a short story about a robot learning to love:\n\n"
);
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp), [Ollama](https://modelfusion.dev/integration/model-provider/ollama), [Hugging Face](https://modelfusion.dev/integration/model-provider/huggingface), [Cohere](https://modelfusion.dev/integration/model-provider/cohere), [Anthropic](https://modelfusion.dev/integration/model-provider/anthropic)

#### streamText

```ts
const textStream = await streamText(
  openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),
  "Write a short story about a robot learning to love:\n\n"
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp), [Ollama](https://modelfusion.dev/integration/model-provider/ollama), [Cohere](https://modelfusion.dev/integration/model-provider/cohere), [Anthropic](https://modelfusion.dev/integration/model-provider/anthropic)

#### streamText with multi-modal prompt

Multi-modal vision models such as GPT 4 Vision can process images as part of the prompt.

```ts
const textStream = await streamText(
  openai.ChatTextGenerator({ model: "gpt-4-vision-preview" }),
  [
    OpenAIChatMessage.user("Describe the image in detail:", {
      image: { base64Content: image, mimeType: "image/png" },
    }),
  ]
);
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp)

### [Generate Image](https://modelfusion.dev/guide/function/generate-image)

Generate an image from a prompt.

```ts
const image = await generateImage(
  openai.ImageGenerator({ model: "dall-e-3", size: "1024x1024" }),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

Providers: [OpenAI (Dall·E)](https://modelfusion.dev/integration/model-provider/openai), [Stability AI](https://modelfusion.dev/integration/model-provider/stability), [Automatic1111](https://modelfusion.dev/integration/model-provider/automatic1111)

### [Generate Speech](https://modelfusion.dev/guide/function/generate-speech)

Synthesize speech (audio) from text. Also called TTS (text-to-speech).

#### generateSpeech

`generateSpeech` synthesizes speech from text.

```ts
// `speech` is a Buffer with MP3 audio data
const speech = await generateSpeech(
  lmnt.Speech({
    voice: "034b632b-df71-46c8-b440-86a42ffc3cf3", // Henry
  }),
  "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
    "as The Rolling Stones unveil 'Hackney Diamonds,' their first collection of " +
    "fresh tunes in nearly twenty years, featuring the illustrious Lady Gaga, the " +
    "magical Stevie Wonder, and the final beats from the late Charlie Watts."
);
```

Providers: [Eleven Labs](https://modelfusion.dev/integration/model-provider/elevenlabs), [LMNT](https://modelfusion.dev/integration/model-provider/lmnt), [OpenAI](https://modelfusion.dev/integration/model-provider/openai)

#### streamSpeech

`generateSpeech` generates a stream of speech chunks from text or from a text stream. Depending on the model, this can be fully duplex.

```ts
const textStream = await streamText(/* ... */);

const speechStream = await streamSpeech(
  elevenlabs.Speech({
    model: "eleven_turbo_v2",
    voice: "pNInz6obpgDQGcFmaJgB", // Adam
    optimizeStreamingLatency: 1,
    voiceSettings: { stability: 1, similarityBoost: 0.35 },
    generationConfig: {
      chunkLengthSchedule: [50, 90, 120, 150, 200],
    },
  }),
  textStream
);

for await (const part of speechStream) {
  // each part is a Buffer with MP3 audio data
}
```

Providers: [Eleven Labs](https://modelfusion.dev/integration/model-provider/elevenlabs)

### [Generate Transcription](https://modelfusion.dev/guide/function/generate-transcription)

Transcribe speech (audio) data into text. Also called speech-to-text (STT).

```ts
const transcription = await generateTranscription(
  openai.Transcription({ model: "whisper-1" }),
  {
    type: "mp3",
    data: await fs.promises.readFile("data/test.mp3"),
  }
);
```

Providers: [OpenAI (Whisper)](https://modelfusion.dev/integration/model-provider/openai)

### [Generate Structure](https://modelfusion.dev/guide/function/generate-structure#generatestructure)

Generate typed objects using a language model and a schema.

#### generateStructure

Generate a structure that matches a schema.

```ts
const sentiment = await generateStructure(
  openai.ChatTextGenerator({
    model: "gpt-3.5-turbo",
    temperature: 0,
    maxCompletionTokens: 50,
  }),
  new ZodStructureDefinition({
    name: "sentiment",
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

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai)

#### streamStructure

Stream a structure that matches a schema. Partial structures before the final part are untyped JSON.

```ts
const structureStream = await streamStructure(
  openai.ChatTextGenerator({
    model: "gpt-3.5-turbo",
    temperature: 0,
    maxCompletionTokens: 2000,
  }),
  new ZodStructureDefinition({
    name: "generateCharacter" as const,
    description: "Generate character descriptions.",
    schema: z.object({
      characters: z.array(
        z.object({
          name: z.string(),
          class: z
            .string()
            .describe("Character class, e.g. warrior, mage, or thief."),
          description: z.string(),
        })
      ),
    }),
  }),
  [
    OpenAIChatMessage.user(
      "Generate 3 character descriptions for a fantasy role playing game."
    ),
  ]
);

for await (const part of structureStream) {
  if (!part.isComplete) {
    const unknownPartialStructure = part.value;
    console.log("partial value", unknownPartialStructure);
  } else {
    const fullyTypedStructure = part.value;
    console.log("final value", fullyTypedStructure);
  }
}
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai)

### [Embed Value](https://modelfusion.dev/guide/function/embed)

Create embeddings for text and other values. Embeddings are vectors that represent the essence of the values in the context of the model.

```ts
// embed single value:
const embedding = await embed(
  new OpenAITextEmbeddingModel({ model: "text-embedding-ada-002" }),
  "At first, Nox didn't know what to do with the pup."
);

// embed many values:
const embeddings = await embedMany(
  new OpenAITextEmbeddingModel({ model: "text-embedding-ada-002" }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]
);
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp), [Ollama](https://modelfusion.dev/integration/model-provider/ollama), [Hugging Face](https://modelfusion.dev/integration/model-provider/huggingface), [Cohere](https://modelfusion.dev/integration/model-provider/cohere)

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

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp), [Cohere](https://modelfusion.dev/integration/model-provider/cohere)

### [Guards](https://modelfusion.dev/guide/guard)

Guard functions can be used to implement retry on error, redacting and changing reponses, etc.

#### Retry structure parsing on error

```ts
const result = await guard(
  (input, options) =>
    generateStructure(
      openai.ChatTextGenerator({
        // ...
      }),
      new ZodStructureDefinition({
        // ...
      }),
      input,
      options
    ),
  [
    // ...
  ],
  fixStructure({
    modifyInputForRetry: async ({ input, error }) => [
      ...input,
      OpenAIChatMessage.functionCall(null, {
        name: error.structureName,
        arguments: error.valueText,
      }),
      OpenAIChatMessage.user(error.message),
      OpenAIChatMessage.user("Please fix the error and try again."),
    ],
  })
);
```

### [Tools](https://modelfusion.dev/guide/tools)

Tools are functions that can be executed by an AI model. They are useful for building chatbots and agents.

Predefined tools: [SerpAPI](https://modelfusion.dev/integration/tool/serpapi), [Google Custom Search](https://modelfusion.dev/integration/tool/google-custom-search)

#### [Creating Tools](https://modelfusion.dev/guide/tools/create-tools)

A tool is comprised of an async execute function, a name, a description, and a schema for the input parameters.

```ts
const calculator = new Tool({
  name: "calculator",
  description: "Execute a calculation",

  parameters: new ZodSchema(
    z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
      operator: z
        .enum(["+", "-", "*", "/"])
        .describe("The operator (+, -, *, /)."),
    })
  ),

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

#### [generateToolCall](https://modelfusion.dev/guide/tools/generate-tool-call)

With `generateToolCall`, you can generate a tool call for a specific tool with a language model that supports tools calls (e.g. OpenAI Chat). This function does not execute the tools.

```ts
const { id, name, args } = await generateToolCall(
  openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
  calculator,
  [OpenAIChatMessage.user("What's fourteen times twelve?")]
);
```

#### [generateToolCallsOrText](https://modelfusion.dev/guide/tools/generate-tool-calls-or-text)

With `generateToolCallsOrText`, you can ask a language model to generate several tool calls as well as text. The model will choose which tools (if any) should be called with which arguments. Both the text and the tool calls are optional. This function does not execute the tools.

```ts
const { text, toolCalls } = await generateToolCallsOrText(
  openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
  [toolA, toolB, toolC],
  [OpenAIChatMessage.user(query)]
);
```

#### [executeTool](https://modelfusion.dev/guide/tools/execute-tool)

You can directly invoke a tool with `executeTool`:

```ts
const result = await executeTool(calculator, {
  a: 14,
  b: 12,
  operator: "*",
});
```

#### [useTool](https://modelfusion.dev/guide/tools/use-tool)

With `useTool`, you can use a tool with a language model that supports tools calls (e.g. OpenAI Chat). `useTool` first generates a tool call and then executes the tool with the arguments.

```ts
const { tool, toolCall, args, ok, result } = await useTool(
  openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
  calculator,
  [OpenAIChatMessage.user("What's fourteen times twelve?")]
);

console.log(`Tool call:`, toolCall);
console.log(`Tool:`, tool);
console.log(`Arguments:`, args);
console.log(`Ok:`, ok);
console.log(`Result or Error:`, result);
```

#### [useToolsOrGenerateText](https://modelfusion.dev/guide/tools/use-tools-or-generate-text)

With `useToolsOrGenerateText`, you can ask a language model to generate several tool calls as well as text. The model will choose which tools (if any) should be called with which arguments. Both the text and the tool calls are optional. This function executes the tools.

```ts
const { text, toolResults } = await useToolsOrGenerateText(
  openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
  [calculator /* ... */],
  [OpenAIChatMessage.user("What's fourteen times twelve?")]
);
```

#### [Agent Loop](https://modelfusion.dev/guide/tools/agent-loop)

You can use `useToolsOrGenerateText` to implement an agent loop that responds to user messages and executes tools. [Learn more](https://modelfusion.dev/guide/tools/agent-loop).

### [Vector Indices](https://modelfusion.dev/guide/vector-index)

```ts
const texts = [
  "A rainbow is an optical phenomenon that can occur under certain meteorological conditions.",
  "It is caused by refraction, internal reflection and dispersion of light in water droplets resulting in a continuous spectrum of light appearing in the sky.",
  // ...
];

const vectorIndex = new MemoryVectorIndex<string>();
const embeddingModel = new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
});

// update an index - usually done as part of an ingestion process:
await upsertIntoVectorIndex({
  vectorIndex,
  embeddingModel,
  objects: texts,
  getValueToEmbed: (text) => text,
});

// retrieve text chunks from the vector index - usually done at query time:
const retrievedTexts = await retrieve(
  new VectorIndexRetriever({
    vectorIndex,
    embeddingModel,
    maxResults: 3,
    similarityThreshold: 0.8,
  }),
  "rainbow and water droplets"
);
```

Available Vector Stores: [Memory](https://modelfusion.dev/integration/vector-index/memory), [SQLite VSS](https://modelfusion.dev/integration/vector-index/sqlite-vss), [Pinecone](https://modelfusion.dev/integration/vector-index/pinecone)

### [Text Generation Prompt Formats](https://modelfusion.dev/guide/function/generate-text#prompt-format)

Prompt formats let you use higher level prompt structures (such as text, instruction or chat prompts) for different models.

#### Text Prompt Example

```ts
const text = await generateText(
  anthropic
    .TextGenerator({
      model: "claude-instant-1",
    })
    .withTextPrompt(),
  "Write a short story about a robot learning to love"
);
```

#### Instruction Prompt Example

```ts
// example assumes you are running https://huggingface.co/TheBloke/Llama-2-7B-GGUF with llama.cpp
const text = await generateText(
  llamacpp
    .TextGenerator({
      contextWindowSize: 4096, // Llama 2 context window size
      maxCompletionTokens: 1000,
    })
    .withTextPromptFormat(Llama2PromptFormat.instruction()),
  {
    system: "You are a story writer.",
    instruction: "Write a short story about a robot learning to love.",
  }
);
```

They can also be accessed through the shorthand methods `.withTextPrompt()`, `.withChatPrompt()` and `.withInstructionPrompt()` for many models:

#### Chat Prompt Example

```ts
const textStream = await streamText(
  openai
    .ChatTextGenerator({
      model: "gpt-3.5-turbo",
    })
    .withChatPrompt(),
  {
    system: "You are a celebrated poet.",
    messages: [
      {
        role: "user",
        content: "Suggest a name for a robot.",
      },
      {
        role: "assistant",
        content: "I suggest the name Robbie",
      },
      {
        role: "user",
        content: "Write a short story about Robbie learning to love",
      },
    ],
  }
);
```

| Prompt Format | Text Prompt | Instruction Prompt | Chat Prompt |
| ------------- | ----------- | ------------------ | ----------- |
| OpenAI Chat   | ✅          | ✅                 | ✅          |
| Anthropic     | ✅          | ✅                 | ✅          |
| Llama 2       | ✅          | ✅                 | ✅          |
| ChatML        | ✅          | ✅                 | ✅          |
| Alpaca        | ✅          | ✅                 | ❌          |
| Vicuna        | ❌          | ❌                 | ✅          |
| Generic Text  | ✅          | ✅                 | ✅          |

### [Image Generation Prompt Formats](https://modelfusion.dev/guide/function/generate-image/prompt-format)

You an use prompt formats with image models as well, e.g. to use a basic text prompt. It is available as a shorthand method:

```ts
const image = await generateImage(
  stability
    .ImageGenerator({
      //...
    })
    .withBasicPrompt(),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

| Prompt Format | Basic Text Prompt |
| ------------- | ----------------- |
| Automatic1111 | ✅                |
| Stability     | ✅                |

### Metadata and original responses

ModelFusion model functions return rich results that include the original response and metadata when you set the `returnType` option to `full`.

```ts
// access the full response (needs to be typed) and the metadata:
const { value, response, metadata } = await generateText(
  openai.CompletionTextGenerator({
    model: "gpt-3.5-turbo-instruct",
    maxCompletionTokens: 1000,
    n: 2, // generate 2 completions
  }),
  "Write a short story about a robot learning to love:\n\n",
  { returnType: "full" }
);

console.log(metadata);

// cast to the response type:
for (const choice of (response as OpenAICompletionResponse).choices) {
  console.log(choice.text);
}
```

### Logging and Observability

ModelFusion provides an [observer framework](https://modelfusion.dev/guide/util/observer) and [out-of-the-box logging support](https://modelfusion.dev/guide/util/logging). You can easily trace runs and call hierarchies, and you can add your own observers.

#### Global Logging Example

```ts
setGlobalFunctionLogging("detailed-object"); // log full events
```

### [Server](https://modelfusion.dev/guide/server/)

> [!WARNING]
> ModelFusion Server is in its initial development phase and not feature-complete. The API is experimental and breaking changes are likely. Feedback and suggestions are welcome.

ModelFusion Server is desigend for running multi-modal generative AI flows that take up to several minutes to complete. It provides the following benefits:

- 🔄 Real-time progress updates via custom server-sent events
- 🔒Type-safety with Zod-schema for inputs/events
- 📦 Efficient handling of dynamically created binary assets (images, audio)
- 📜 Auto-logging for AI model interactions within flows

ModelFusion provides a [Fastify](https://fastify.dev/) plugin that allows you to set up a server that exposes your ModelFusion flows as REST endpoints using server-sent events.

```ts
import {
  FileSystemAssetStorage,
  FileSystemLogger,
  modelFusionFastifyPlugin,
} from "modelfusion/fastify-server"; // '/fastify-server' import path

// configurable logging for all runs using ModelFusion observability:
const logger = new FileSystemLogger({
  path: (run) => path.join(fsBasePath, run.runId, "logs"),
});

// configurable storage for large files like images and audio files:
const assetStorage = new FileSystemAssetStorage({
  path: (run) => path.join(fsBasePath, run.runId, "assets"),
  logger,
});

fastify.register(modelFusionFastifyPlugin, {
  baseUrl,
  basePath: "/myFlow",
  logger,
  assetStorage,
  flow: exampleFlow,
});
```

Using `invokeFlow`, you can easily connect your client to a ModelFusion flow endpoint:

```ts
import { invokeFlow } from "modelfusion/browser"; // '/browser' import path

invokeFlow({
  url: `${BASE_URL}/myFlow`,
  schema: myFlowSchema,
  input: { prompt },
  onEvent(event) {
    switch (event.type) {
      case "my-event": {
        // do something with the event
        break;
      }
      // more events...
    }
  },
  onStop() {
    // flow finished
  },
});
```

## Documentation

### [Guide](https://modelfusion.dev/guide)

- [Model Functions](https://modelfusion.dev/guide/function/)
  - [Generate text](https://modelfusion.dev/guide/function/generate-text)
  - [Generate image](https://modelfusion.dev/guide/function/generate-image)
  - [Generate speech](https://modelfusion.dev/guide/function/generate-speech)
  - [Generate transcription](https://modelfusion.dev/guide/function/generation-transcription)
  - [Generate structure](https://modelfusion.dev/guide/function/generate-structure)
  - [Generate structure or text](https://modelfusion.dev/guide/function/generate-structure-or-text)
  - [Tokenize Text](https://modelfusion.dev/guide/function/tokenize-text)
  - [Embed Value](https://modelfusion.dev/guide/function/embed)
- [Guards](https://modelfusion.dev/guide/guard)
- [Tools](https://modelfusion.dev/guide/tools)
- [Vector Indices](https://modelfusion.dev/guide/vector-index)
  - [Upsert](https://modelfusion.dev/guide/vector-index/upsert)
  - [Retrieve](https://modelfusion.dev/guide/vector-index/retrieve)
- [Text Chunks](https://modelfusion.dev/guide/text-chunk/)
  - [Split Text](https://modelfusion.dev/guide/text-chunk/split)
- [Server](https://modelfusion.dev/guide/server/)
- [Utilities](https://modelfusion.dev/guide/util/)
  - [API Configuration](https://modelfusion.dev/guide/util/api-configuration)
    - [Retry strategies](https://modelfusion.dev/guide/util/api-configuration/retry)
    - [Throttling strategies](https://modelfusion.dev/guide/util/api-configuration/throttle)
  - [Logging](https://modelfusion.dev/guide/util/logging)
  - [Observers](https://modelfusion.dev/guide/util/observer)
  - [Runs](https://modelfusion.dev/guide/util/run)
  - [Abort signals](https://modelfusion.dev/guide/util/abort)
  - [Cost calculation](https://modelfusion.dev/guide/util/cost-calculation)
- [Troubleshooting](https://modelfusion.dev/guide/troubleshooting)
  - [Bundling](https://modelfusion.dev/guide/troubleshooting/bundling)

### [Examples & Tutorials](https://modelfusion.dev/tutorial)

### [Integrations](https://modelfusion.dev/integration/model-provider)

### [API Reference](https://modelfusion.dev/api/modules)

## More Examples

### [Basic Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic)

Examples for almost all of the individual functions and objects. Highly recommended to get started.

### [StoryTeller](https://github.com/lgrammel/storyteller)

> _multi-modal_, _structure streaming_, _image generation_, _text to speech_, _speech to text_, _text generation_, _structure generation_, _embeddings_

StoryTeller is an exploratory web application that creates short audio stories for pre-school kids.

### [Chatbot (Terminal)](https://github.com/lgrammel/modelfusion/tree/main/examples/chatbot-terminal)

> _Terminal app_, _chat_, _llama.cpp_

A chat with an AI assistant, implemented as a terminal app.

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

### [Duplex Speech Streaming (using Vite/React & ModelFusion Server/Fastify)](https://github.com/lgrammel/modelfusion/tree/main/examples/speech-streaming-vite-react-fastify)

> _Speech Streaming_, _OpenAI_, _Elevenlabs_ _streaming_, _Vite_, _Fastify_, _ModelFusion Server_

Given a prompt, the server returns both a text and a speech stream response.

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

### [Cloudflare Workers](https://github.com/lgrammel/modelfusion/tree/main/examples/cloudflare-workers)

> _Cloudflare_, _OpenAI_

Generate text on a Cloudflare Worker using ModelFusion and OpenAI.

## Contributing

### [Contributing Guide](https://github.com/lgrammel/modelfusion/blob/main/CONTRIBUTING.md)

Read the [ModelFusion contributing guide](https://github.com/lgrammel/modelfusion/blob/main/CONTRIBUTING.md) to learn about the development process, how to propose bugfixes and improvements, and how to build and test your changes.
