# ModelFusion

> ### Build AI applications, chatbots, and agents with JavaScript and TypeScript.

[![NPM Version](https://img.shields.io/npm/v/modelfusion?color=33cd56&logo=npm)](https://www.npmjs.com/package/modelfusion)
[![MIT License](https://img.shields.io/github/license/lgrammel/modelfusion)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-modelfusion.dev-blue)](https://modelfusion.dev)
[![Discord](https://discordapp.com/api/guilds/1136309340740006029/widget.png?style=shield)](https://discord.gg/GqCwYZATem)
[![Created by Lars Grammel](https://img.shields.io/badge/created%20by-@lgrammel-4BBAAB.svg)](https://twitter.com/lgrammel)

[Introduction](#introduction) | [Quick Install](#quick-install) | [Usage](#usage-examples) | [Documentation](#documentation) | [Examples](#more-examples) | [Contributing](#contributing) | [modelfusion.dev](https://modelfusion.dev)

> [!NOTE]
> ModelFusion is in its initial development phase. Until version 1.0 there may be breaking changes, because I am still exploring the API design. Feedback and suggestions are welcome.

## Introduction

ModelFusion is a library for building AI apps, chatbots, and agents. It provides abstractions for AI models, vector indices, and tools.

- **Type inference and validation**: ModelFusion uses TypeScript and [Zod](https://github.com/colinhacks/zod) to infer types wherever possible and to validate model responses.
- **Flexibility and control**: AI application development can be complex and unique to each project. With ModelFusion, you have complete control over the prompts and model settings, and you can access the raw responses from the models quickly to build what you need.
- **No chains and predefined prompts**: Use the concepts provided by JavaScript (variables, functions, etc.) and explicit prompts to build applications you can easily understand and control. Not hidden prompts and logic.
- **Multimodal Support**: Beyond just LLMs, ModelFusion encompasses a diverse array of models including text generation, text-to-speech, speech-to-text, and image generation, allowing you to build multifaceted AI applications with ease.
- **Integrated support features**: Essential features like logging, retries, throttling, tracing, and error handling are built-in, helping you focus more on building your application.

## Quick Install

```sh
npm install modelfusion
```

Or use a template: [ModelFusion terminal app starter](https://github.com/lgrammel/modelfusion-terminal-app-starter)

## Usage Examples

You can provide API keys for the different [integrations](https://modelfusion.dev/integration/model-provider/) using environment variables (e.g., `OPENAI_API_KEY`) or pass them into the model constructors as options.

### [Generate Text](https://modelfusion.dev/guide/function/generate-text)

Generate text using a language model and a prompt.
You can stream the text if it is supported by the model.
You can use [prompt formats](https://modelfusion.dev/guide/function/generate-text/prompt-format) to change the prompt format of a model.

#### generateText

```ts
const text = await generateText(
  new OpenAITextGenerationModel({
    model: "gpt-3.5-turbo-instruct",
  }),
  "Write a short story about a robot learning to love:\n\n"
);
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Cohere](https://modelfusion.dev/integration/model-provider/cohere), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp), [Hugging Face](https://modelfusion.dev/integration/model-provider/huggingface)

#### streamText

```ts
const textStream = await streamText(
  new OpenAITextGenerationModel({
    model: "gpt-3.5-turbo-instruct",
  }),
  "Write a short story about a robot learning to love:\n\n"
);

for await (const textFragment of textStream) {
  process.stdout.write(textFragment);
}
```

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Cohere](https://modelfusion.dev/integration/model-provider/cohere), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp)

#### Prompt Format

[Prompt format](https://modelfusion.dev/guide/function/generate-text/prompt-format) lets you use higher level prompt structures (such as instruction or chat prompts) for different models.

```ts
const text = await generateText(
  new LlamaCppTextGenerationModel({
    contextWindowSize: 4096, // Llama 2 context window size
    maxCompletionTokens: 1000,
  }).withPromptFormat(mapInstructionPromptToLlama2Format()),
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
  }).withPromptFormat(mapChatPromptToOpenAIChatFormat()),
  [
    { system: "You are a celebrated poet." },
    { user: "Write a short story about a robot learning to love." },
    { ai: "Once upon a time, there was a robot who learned to love." },
    { user: "That's a great start!" },
  ]
);
```

| Prompt Format | Instruction Prompt | Chat Prompt |
| ------------- | ------------------ | ----------- |
| OpenAI Chat   | ✅                 | ✅          |
| Llama 2       | ✅                 | ✅          |
| Alpaca        | ✅                 | ❌          |
| Vicuna        | ❌                 | ✅          |
| Generic Text  | ✅                 | ✅          |

#### Metadata and original responses

ModelFusion model functions return rich results that include the original response and metadata when you call `.asFullResponse()` before resolving the promise.

```ts
// access the full response and the metadata:
// the response type is specific to the model that's being used
const { output, response, metadata } = await generateText(
  new OpenAITextGenerationModel({
    model: "gpt-3.5-turbo-instruct",
    maxCompletionTokens: 1000,
    n: 2, // generate 2 completions
  }),
  "Write a short story about a robot learning to love:\n\n"
).asFullResponse();

for (const choice of response.choices) {
  console.log(choice.text);
}

console.log(`Duration: ${metadata.durationInMs}ms`);
```

### [Generate Structure](https://modelfusion.dev/guide/function/generate-structure)

Generate a structure that matches a schema.

```ts
const sentiment = await generateStructure(
  new OpenAIChatModel({
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

### [Generate Structure or Text](https://modelfusion.dev/guide/function/generate-structure-or-text)

Generate a structure (or text as a fallback) using a prompt and multiple schemas.
It either matches one of the schemas or is text reponse.

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

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai)

### [Tools](https://modelfusion.dev/guide/tools)

Tools are functions that can be executed by an AI model. They are useful for building chatbots and agents.

Predefined tools: [SerpAPI](https://modelfusion.dev/integration/tool/serpapi), [Google Custom Search](https://modelfusion.dev/integration/tool/google-custom-search)

#### Create Tool

A tool is a function with a name, a description, and a schema for the input parameters.

```ts
const calculator = new Tool({
  name: "calculator",
  description: "Execute a calculation",

  inputSchema: new ZodSchema(
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

#### useTool

The model determines the parameters for the tool from the prompt and then executes it.

```ts
const { tool, parameters, result } = await useTool(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  calculator,
  [OpenAIChatMessage.user("What's fourteen times twelve?")]
);
```

#### useToolOrGenerateText

The model determines which tool to use and its parameters from the prompt and then executes it.
Text is generated as a fallback.

```ts
const { tool, parameters, result, text } = await useToolOrGenerateText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  [calculator /* and other tools... */],
  [OpenAIChatMessage.user("What's fourteen times twelve?")]
);
```

### [Transcribe Speech](https://modelfusion.dev/guide/function/transcribe-speech)

Turn speech (audio) into text.

```ts
const transcription = await transcribe(
  new OpenAITranscriptionModel({ model: "whisper-1" }),
  {
    type: "mp3",
    data: await fs.promises.readFile("data/test.mp3"),
  }
);
```

Providers: [OpenAI (Whisper)](https://modelfusion.dev/integration/model-provider/openai)

### [Synthesize Speech](https://modelfusion.dev/guide/function/synthesize-speech)

Turn text into speech (audio).

```ts
// `speech` is a Buffer with MP3 audio data
const speech = await synthesizeSpeech(
  new LmntSpeechSynthesisModel({
    voice: "034b632b-df71-46c8-b440-86a42ffc3cf3", // Henry
  }),
  "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
    "as The Rolling Stones unveil 'Hackney Diamonds,' their first collection of " +
    "fresh tunes in nearly twenty years, featuring the illustrious Lady Gaga, the " +
    "magical Stevie Wonder, and the final beats from the late Charlie Watts."
);
```

Providers: [Eleven Labs](https://modelfusion.dev/integration/model-provider/elevenlabs), [LMNT](https://modelfusion.dev/integration/model-provider/lmnt)

### [Describe Image](https://modelfusion.dev/guide/function/describe-image)

Describe an image as text, e.g. for image captioning or OCR.

```ts
const text = await describeImage(
  new HuggingFaceImageDescriptionModel({
    model: "nlpconnect/vit-gpt2-image-captioning",
  }),
  data: buffer
);
```

Providers: [HuggingFace](/integration/model-provider/huggingface)

### [Generate Image](https://modelfusion.dev/guide/function/generate-image)

Generate a base64-encoded image from a prompt.

```ts
const image = await generateImage(
  new OpenAIImageGenerationModel({ size: "512x512" }),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

Providers: [OpenAI (Dall·E)](https://modelfusion.dev/integration/model-provider/openai), [Stability AI](https://modelfusion.dev/integration/model-provider/stability), [Automatic1111](https://modelfusion.dev/integration/model-provider/automatic1111)

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

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Cohere](https://modelfusion.dev/integration/model-provider/cohere), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp), [Hugging Face](https://modelfusion.dev/integration/model-provider/huggingface)

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

Providers: [OpenAI](https://modelfusion.dev/integration/model-provider/openai), [Cohere](https://modelfusion.dev/integration/model-provider/cohere), [Llama.cpp](https://modelfusion.dev/integration/model-provider/llamacpp)

### [Upserting and Retrieving Objects from Vector Indices](https://modelfusion.dev/guide/vector-index)

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

Available Vector Stores: [Memory](https://modelfusion.dev/integration/vector-index/memory), [Pinecone](https://modelfusion.dev/integration/vector-index/pinecone)

### Observability

Integrations: [Helicone](https://modelfusion.dev/integration/observability/helicone)

## Documentation

### [Guide](https://modelfusion.dev/guide)

- [Model Functions](https://modelfusion.dev/guide/function/)
  - [Generate and stream text](https://modelfusion.dev/guide/function/generate-text)
  - [Generate structure](https://modelfusion.dev/guide/function/generate-structure)
  - [Generate structure or text](https://modelfusion.dev/guide/function/generate-structure-or-text)
  - [Embed Text](https://modelfusion.dev/guide/function/embed-text)
  - [Tokenize Text](https://modelfusion.dev/guide/function/tokenize-text)
  - [Transcribe Speech](https://modelfusion.dev/guide/function/transcribe-speech)
  - [Synthesize Speech](https://modelfusion.dev/guide/function/synthesize-speech)
  - [Describe Image](https://modelfusion.dev/guide/function/describe-image)
  - [Generate Image](https://modelfusion.dev/guide/function/generate-image)
- [Tools](https://modelfusion.dev/guide/tools)
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
  - [Cost calculation](https://modelfusion.dev/guide/util/cost-calculation)

### [Integrations](https://modelfusion.dev/integration/model-provider)

### [API Reference](https://modelfusion.dev/api/modules)

## More Examples

### [Basic Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic)

Examples for almost all of the individual functions and objects. Highly recommended to get started.

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

## Contributing

### [Contributing Guide](https://github.com/lgrammel/modelfusion/blob/main/CONTRIBUTING.md)

Read the [ModelFusion contributing guide](https://github.com/lgrammel/modelfusion/blob/main/CONTRIBUTING.md) to learn about the development process, how to propose bugfixes and improvements, and how to build and test your changes.
