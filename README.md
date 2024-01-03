# ModelFusion

> ### The TypeScript library for building sAI applications.

[![NPM Version](https://img.shields.io/npm/v/modelfusion?color=33cd56&logo=npm)](https://www.npmjs.com/package/modelfusion)
[![MIT License](https://img.shields.io/github/license/lgrammel/modelfusion)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-modelfusion.dev-blue)](https://modelfusion.dev)
[![Discord](https://discordapp.com/api/guilds/1136309340740006029/widget.png?style=shield)](https://discord.gg/GqCwYZATem)
[![Created by Lars Grammel](https://img.shields.io/badge/created%20by-@lgrammel-4BBAAB.svg)](https://twitter.com/lgrammel)

[Introduction](#introduction) | [Quick Install](#quick-install) | [Usage](#usage-examples) | [Documentation](#documentation) | [Examples](#more-examples) | [Contributing](#contributing) | [modelfusion.dev](https://modelfusion.dev)

## Introduction

**ModelFusion** is an abstraction layer for integrating AI models into JavaScript and TypeScript applications, unifying the API for common operations such as **text streaming**, **structure generation**, and **tool usage**. It provides features to support production environments, including observability hooks, logging, and automatic retries. You can use ModelFusion to build AI applications, chatbots, and agents.

- **Vendor-neutral**: ModelFusion is a non-commercial open source project that is community-driven. You can use it with any supported provider.
- **Multi-modal**: ModelFusion supports a wide range of models including text generation, image generation, vision, text-to-speech, speech-to-text, and embedding models.
- **Type inference and validation**: ModelFusion infers TypeScript types wherever possible and validates model responses.
- **Observability and logging**: ModelFusion provides an observer framework and out-of-the-box logging support.
- **Resilience and robustness**: ModelFusion ensures seamless operation through automatic retries, throttling, and error handling mechanisms.
- **Built for production**: ModelFusion is fully tree-shakeable, can be used in serverless environments, and only uses a minimal set of dependencies.

> [!NOTE]
> ModelFusion is getting closer to a stable v1, which is expected in Q1/2024. The main API is now mostly stable, but until version 1.0 there may be breaking changes. Feedback and suggestions are welcome.

## Quick Install

```sh
npm install modelfusion
```

Or use a template:

- [ModelFusion terminal app starter](https://github.com/lgrammel/modelfusion-terminal-app-starter)
- [Next.js, Vercel AI SDK, Llama.cpp & ModelFusion starter](https://github.com/lgrammel/modelfusion-llamacpp-nextjs-starter)
- [Next.js, Vercel AI SDK, Ollama & ModelFusion starter](https://github.com/lgrammel/modelfusion-ollama-nextjs-starter)

## Usage Examples

> [!TIP]
> The basic examples are a great way to get started and to explore in parallel with the [documentation](https://modelfusion.dev/). You can find them in the [examples/basic](https://github.com/lgrammel/modelfusion/tree/main/examples/basic) folder.

You can provide API keys for the different [integrations](https://modelfusion.dev/integration/model-provider/) using environment variables (e.g., `OPENAI_API_KEY`) or pass them into the model constructors as options.

### [Generate Text](https://modelfusion.dev/guide/function/generate-text)

Generate text using a language model and a prompt. You can stream the text if it is supported by the model. You can use images for multi-modal prompting if the model supports it (e.g. with [llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp)).
You can use [prompt templates](https://modelfusion.dev/guide/function/generate-text#prompt-template) to change the prompt template of a model.

#### generateText

```ts
import { generateText, openai } from "modelfusion";

const text = await generateText(
  openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),
  "Write a short story about a robot learning to love:\n\n"
);
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [OpenAI compatible](https://modelfusion.dev/integration/model-provider/openaicompatible), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp), [Ollama](https://modelfusion.dev/integration/model-provider/ollama), [Mistral](https://modelfusion.dev/integration/model-provider/mistral), [Hugging Face](https://modelfusion.dev/integration/model-provider/huggingface), [Cohere](https://modelfusion.dev/integration/model-provider/cohere), [Anthropic](https://modelfusion.dev/integration/model-provider/anthropic)

#### streamText

```ts
import { streamText, openai } from "modelfusion";

const textStream = await streamText(
  openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),
  "Write a short story about a robot learning to love:\n\n"
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [OpenAI compatible](https://modelfusion.dev/integration/model-provider/openaicompatible), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp), [Ollama](https://modelfusion.dev/integration/model-provider/ollama), [Mistral](https://modelfusion.dev/integration/model-provider/mistral), [Cohere](https://modelfusion.dev/integration/model-provider/cohere), [Anthropic](https://modelfusion.dev/integration/model-provider/anthropic)

#### streamText with multi-modal prompt

Multi-modal vision models such as GPT 4 Vision can process images as part of the prompt.

```ts
import { streamText, openai } from "modelfusion";
import { readFileSync } from "fs";

const image = readFileSync("./image.png").toString("base64");

const textStream = await streamText(
  openai.ChatTextGenerator({ model: "gpt-4-vision-preview" }),
  [
    openai.ChatMessage.user([
      { type: "text", text: "Describe the image in detail:" },
      { type: "image", base64Image: image, mimeType: "image/png" },
    ]),
  ]
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [OpenAI compatible](https://modelfusion.dev/integration/model-provider/openaicompatible), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp), [Ollama](https://modelfusion.dev/integration/model-provider/ollama)

### [Generate Image](https://modelfusion.dev/guide/function/generate-image)

Generate an image from a prompt.

```ts
import { generateImage, openai } from "modelfusion";

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
import { generateSpeech, lmnt } from "modelfusion";

// `speech` is a Buffer with MP3 audio data
const speech = await generateSpeech(
  lmnt.SpeechGenerator({
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
import { streamSpeech, elevenlabs } from "modelfusion";

const textStream: AsyncIterable<string>;

const speechStream = await streamSpeech(
  elevenlabs.SpeechGenerator({
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
import { generateTranscription, openai } from "modelfusion";

const transcription = await generateTranscription(
  openai.Transcriber({ model: "whisper-1" }),
  {
    type: "mp3",
    data: await fs.promises.readFile("data/test.mp3"),
  }
);
```

Providers: [OpenAI (Whisper)](https://modelfusion.dev/integration/model-provider/openai), [Whisper.cpp](https://modelfusion.dev/integration/model-provider/whispercpp)

### [Generate Structure](https://modelfusion.dev/guide/function/generate-structure#generatestructure)

Generate typed objects using a language model and a schema.

#### generateStructure

Generate a structure that matches a schema.

```ts
import {
  ollama,
  zodSchema,
  generateStructure,
  jsonStructurePrompt,
} from "modelfusion";

const sentiment = await generateStructure(
  // model:
  ollama
    .ChatTextGenerator({
      model: "openhermes2.5-mistral",
      maxGenerationTokens: 1024,
      temperature: 0,
    })
    .asStructureGenerationModel(jsonStructurePrompt.instruction()),

  // schema:
  zodSchema(
    z.object({
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    })
  ),

  // prompt:
  {
    system:
      "You are a sentiment evaluator. " +
      "Analyze the sentiment of the following product review:",
    instruction:
      "After I opened the package, I was met by a very unpleasant smell " +
      "that did not disappear even after washing. Never again!",
  }
);
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Ollama](https://modelfusion.dev//integration/model-provider/ollama)

#### streamStructure

Stream a structure that matches a schema. Partial structures before the final part are untyped JSON.

```ts
import { zodSchema, openai, streamStructure } from "modelfusion";

const structureStream = await streamStructure(
  openai
    .ChatTextGenerator(/* ... */)
    .asFunctionCallStructureGenerationModel({
      fnName: "generateCharacter",
      fnDescription: "Generate character descriptions.",
    })
    .withTextPrompt(),

  zodSchema(
    z.object({
      characters: z.array(
        z.object({
          name: z.string(),
          class: z
            .string()
            .describe("Character class, e.g. warrior, mage, or thief."),
          description: z.string(),
        })
      ),
    })
  ),

  "Generate 3 character descriptions for a fantasy role playing game."
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

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Ollama](https://modelfusion.dev//integration/model-provider/ollama)

### [Embed Value](https://modelfusion.dev/guide/function/embed)

Create embeddings for text and other values. Embeddings are vectors that represent the essence of the values in the context of the model.

```ts
// embed single value:
const embedding = await embed(
  openai.TextEmbedder({ model: "text-embedding-ada-002" }),
  "At first, Nox didn't know what to do with the pup."
);

// embed many values:
const embeddings = await embedMany(
  openai.TextEmbedder({ model: "text-embedding-ada-002" }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]
);
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp), [Ollama](https://modelfusion.dev/integration/model-provider/ollama), [Mistral](https://modelfusion.dev/integration/model-provider/mistral), [Hugging Face](https://modelfusion.dev/integration/model-provider/huggingface), [Cohere](https://modelfusion.dev/integration/model-provider/cohere)

### [Tokenize Text](https://modelfusion.dev/guide/function/tokenize-text)

Split text into tokens and reconstruct the text from tokens.

```ts
const tokenizer = openai.Tokenizer({ model: "gpt-4" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await countTokens(tokenizer, text);

const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp), [Cohere](https://modelfusion.dev/integration/model-provider/cohere)

### [Tools](https://modelfusion.dev/guide/tools)

Tools are functions (and associated metadata) that can be executed by an AI model. They are useful for building chatbots and agents.

ModelFusion offers several tools out-of-the-box: [Math.js](https://modelfusion.dev/guide/tools/available-tools/mathjs), [MediaWiki Search](https://modelfusion.dev/guide/tools/available-tools/mediawiki-search), [SerpAPI](https://modelfusion.dev/guide/tools/available-tools/serpapi), [Google Custom Search](https://modelfusion.dev/guide/tools/available-tools/google-custom-search). You can also create [custom tools](https://modelfusion.dev/guide/tools).

#### [useTool](https://modelfusion.dev/guide/tools/use-tool)

With `useTool`, you can ask a tool-compatible language model (e.g. OpenAI chat) to invoke a single tool. `useTool` first generates a tool call and then executes the tool with the arguments.

```ts
const { tool, toolCall, args, ok, result } = await useTool(
  openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
  calculator,
  [openai.ChatMessage.user("What's fourteen times twelve?")]
);

console.log(`Tool call:`, toolCall);
console.log(`Tool:`, tool);
console.log(`Arguments:`, args);
console.log(`Ok:`, ok);
console.log(`Result or Error:`, result);
```

#### [useTools](https://modelfusion.dev/guide/tools/use-tools)

With `useTools`, you can ask a language model to generate several tool calls as well as text. The model will choose which tools (if any) should be called with which arguments. Both the text and the tool calls are optional. This function executes the tools.

```ts
const { text, toolResults } = await useTools(
  openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
  [calculator /* ... */],
  [openai.ChatMessage.user("What's fourteen times twelve?")]
);
```

#### [Agent Loop](https://modelfusion.dev/guide/tools/agent-loop)

You can use `useTools` to implement an agent loop that responds to user messages and executes tools. [Learn more](https://modelfusion.dev/guide/tools/agent-loop).

### [Vector Indices](https://modelfusion.dev/guide/vector-index)

```ts
const texts = [
  "A rainbow is an optical phenomenon that can occur under certain meteorological conditions.",
  "It is caused by refraction, internal reflection and dispersion of light in water droplets resulting in a continuous spectrum of light appearing in the sky.",
  // ...
];

const vectorIndex = new MemoryVectorIndex<string>();
const embeddingModel = openai.TextEmbedder({
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

### [Text Generation Prompt Templates](https://modelfusion.dev/guide/function/generate-text#prompt-format)

Prompt templates let you use higher level prompt structures (such as text, instruction or chat prompts) for different models.

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
      maxGenerationTokens: 1000,
    })
    .withTextPromptTemplate(Llama2Prompt.instruction()),
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

| Prompt Template  | Text Prompt | Instruction Prompt | Chat Prompt |
| ---------------- | ----------- | ------------------ | ----------- |
| OpenAI Chat      | ✅          | ✅                 | ✅          |
| Anthropic        | ✅          | ✅                 | ✅          |
| Llama 2          | ✅          | ✅                 | ✅          |
| ChatML           | ✅          | ✅                 | ✅          |
| NeuralChat       | ✅          | ✅                 | ✅          |
| Mistral Instruct | ✅          | ✅                 | ✅          |
| Alpaca           | ✅          | ✅                 | ❌          |
| Vicuna           | ❌          | ❌                 | ✅          |
| Generic Text     | ✅          | ✅                 | ✅          |

### [Image Generation Prompt Templates](https://modelfusion.dev/guide/function/generate-image/prompt-format)

You an use prompt templates with image models as well, e.g. to use a basic text prompt. It is available as a shorthand method:

```ts
const image = await generateImage(
  stability
    .ImageGenerator({
      //...
    })
    .withTextPrompt(),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

| Prompt Template | Text Prompt |
| --------------- | ----------- |
| Automatic1111   | ✅          |
| Stability       | ✅          |

### Metadata and original responses

ModelFusion model functions return rich responses that include the original response and metadata when you set the `fullResponse` option to `true`.

```ts
// access the full response (needs to be typed) and the metadata:
const { text, response, metadata } = await generateText(
  openai.CompletionTextGenerator({
    model: "gpt-3.5-turbo-instruct",
    maxGenerationTokens: 1000,
    n: 2, // generate 2 completions
  }),
  "Write a short story about a robot learning to love:\n\n",
  { fullResponse: true }
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
import { modelfusion } from "modelfusion";

modelfusion.setLogFormat("detailed-object"); // log full events
```

## Documentation

### [Guide](https://modelfusion.dev/guide)

- [Model Functions](https://modelfusion.dev/guide/function/)
  - [Generate text](https://modelfusion.dev/guide/function/generate-text)
  - [Generate structure](https://modelfusion.dev/guide/function/generate-structure)
  - [Generate image](https://modelfusion.dev/guide/function/generate-image)
  - [Generate speech](https://modelfusion.dev/guide/function/generate-speech)
  - [Generate transcription](https://modelfusion.dev/guide/function/generation-transcription)
  - [Tokenize Text](https://modelfusion.dev/guide/function/tokenize-text)
  - [Embed Value](https://modelfusion.dev/guide/function/embed)
- [Tools](https://modelfusion.dev/guide/tools)
  - [Use Tool](https://modelfusion.dev/guide/tools/use-tool)
  - [Use Tools](https://modelfusion.dev/guide/tools/use-tools)
  - [Agent Loop](https://modelfusion.dev/guide/tools/agent-loop)
  - [Available Tools](https://modelfusion.dev/guide/tools/available-tools/)
  - [Custom Tools](https://modelfusion.dev/guide/tools/custom-tools)
  - [Advanced](https://modelfusion.dev/guide/tools/advanced)
- [Vector Indices](https://modelfusion.dev/guide/vector-index)
  - [Upsert](https://modelfusion.dev/guide/vector-index/upsert)
  - [Retrieve](https://modelfusion.dev/guide/vector-index/retrieve)
- [Text Chunks](https://modelfusion.dev/guide/text-chunk/)
  - [Split Text](https://modelfusion.dev/guide/text-chunk/split)
- [Utilities](https://modelfusion.dev/guide/util/)
  - [API Configuration](https://modelfusion.dev/guide/util/api-configuration)
    - [Retry strategies](https://modelfusion.dev/guide/util/api-configuration/retry)
    - [Throttling strategies](https://modelfusion.dev/guide/util/api-configuration/throttle)
  - [Logging](https://modelfusion.dev/guide/util/logging)
  - [Observers](https://modelfusion.dev/guide/util/observer)
  - [Runs](https://modelfusion.dev/guide/util/run)
  - [Abort signals](https://modelfusion.dev/guide/util/abort)
- [Experimental](https://modelfusion.dev/guide/experimental/)
  - [Guards](https://modelfusion.dev/guide/experimental/guard)
  - [Server](https://modelfusion.dev/guide/experimental/server/)
  - [Cost calculation](https://modelfusion.dev/guide/experimental/cost-calculation)
- [Troubleshooting](https://modelfusion.dev/guide/troubleshooting)
  - [Bundling](https://modelfusion.dev/guide/troubleshooting/bundling)

### [Integrations](https://modelfusion.dev/integration/model-provider)

### [Examples & Tutorials](https://modelfusion.dev/tutorial)

### [Showcase](https://modelfusion.dev/showcase)

### [API Reference](https://modelfusion.dev/api/modules)

## More Examples

### [Basic Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic)

Examples for almost all of the individual functions and objects. Highly recommended to get started.

### [StoryTeller](https://github.com/lgrammel/storyteller)

> _multi-modal_, _structure streaming_, _image generation_, _text to speech_, _speech to text_, _text generation_, _structure generation_, _embeddings_

StoryTeller is an exploratory web application that creates short audio stories for pre-school kids.

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
