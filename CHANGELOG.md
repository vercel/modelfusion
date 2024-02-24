# Changelog

## v0.137.0 - 2024-02-24

### Changed

- Moved cost calculation into `@modelfusion/cost-calculation` package. Thanks [@jakedetels](https://github.com/jakedetels) for the refactoring!

## v0.136.0 - 2024-02-07

### Added

- `FileCache` for caching responses to disk. Thanks [@jakedetels](https://github.com/jakedetels) for the feature! Example:

  ```ts
  import { generateText, openai } from "modelfusion";
  import { FileCache } from "modelfusion/node";

  const cache = new FileCache();

  const text1 = await generateText({
    model: openai
      .ChatTextGenerator({ model: "gpt-3.5-turbo", temperature: 1 })
      .withTextPrompt(),
    prompt: "Write a short story about a robot learning to love",
    logging: "basic-text",
    cache,
  });

  console.log({ text1 });

  const text2 = await generateText({
    model: openai
      .ChatTextGenerator({ model: "gpt-3.5-turbo", temperature: 1 })
      .withTextPrompt(),
    prompt: "Write a short story about a robot learning to love",
    logging: "basic-text",
    cache,
  });

  console.log({ text2 }); // same text
  ```

## v0.135.1 - 2024-02-04

### Fixed

- Try both dynamic imports and require for loading libraries on demand.

## v0.135.0 - 2024-01-29

### Added

- `ObjectGeneratorTool`: a tool to create synthetic or fictional structured data using `generateObject`. [Docs](https://modelfusion.dev/guide/tools/available-tools/object-generator)
- `jsonToolCallPrompt.instruction()`: Create a instruction prompt for tool calls that uses JSON.

### Changed

- `jsonToolCallPrompt` automatically enables JSON mode or grammars when supported by the model.

## v0.134.0 - 2024-01-28

### Added

- Added prompt function support to `generateText`, `streamText`, `generateObject`, and `streamObject`. You can create prompt functions for text, instruction, and chat prompts using `createTextPrompt`, `createInstructionPrompt`, and `createChatPrompt`. Prompt functions allow you to load prompts from external sources and improve the prompt logging. Example:

  ```ts
  const storyPrompt = createInstructionPrompt(
    async ({ protagonist }: { protagonist: string }) => ({
      system: "You are an award-winning author.",
      instruction: `Write a short story about ${protagonist} learning to love.`,
    })
  );

  const text = await generateText({
    model: openai
      .ChatTextGenerator({ model: "gpt-3.5-turbo" })
      .withInstructionPrompt(),

    prompt: storyPrompt({
      protagonist: "a robot",
    }),
  });
  ```

### Changed

- Refactored build to use `tsup`.

## v0.133.0 - 2024-01-26

### Added

- Support for OpenAI embedding custom dimensions.

### Changed

- **breaking change**: renamed `embeddingDimensions` setting to `dimensions`

## v0.132.0 - 2024-01-25

### Added

- Support for OpenAI `text-embedding-3-small` and `text-embedding-3-large` embedding models.
- Support for OpenAI `gpt-4-turbo-preview`, `gpt-4-0125-preview`, and `gpt-3.5-turbo-0125` chat models.

## v0.131.1 - 2024-01-25

### Fixed

- Add `type-fest` as dependency to fix type inference errors.

## v0.131.0 - 2024-01-23

### Added

- `ObjectStreamResponse` and `ObjectStreamFromResponse` serialization functions for using server-generated object streams in web applications.

  Server example:

  ```ts
  export async function POST(req: Request) {
    const { myArgs } = await req.json();

    const objectStream = await streamObject({
      // ...
    });

    // serialize the object stream to a response:
    return new ObjectStreamResponse(objectStream);
  }
  ```

  Client example:

  ```ts
  const response = await fetch("/api/stream-object-openai", {
    method: "POST",
    body: JSON.stringify({ myArgs }),
  });

  // deserialize (result object is simpler than the full response)
  const stream = ObjectStreamFromResponse({
    schema: itinerarySchema,
    response,
  });

  for await (const { partialObject } of stream) {
    // do something, e.g. setting a React state
  }
  ```

### Changed

- **breaking change**: rename `generateStructure` to `generateObject` and `streamStructure` to `streamObject`. Related names have been changed accordingly.
- **breaking change**: the `streamObject` result stream contains additional data. You need to use `stream.partialObject` or destructuring to access it:

  ```ts
  const objectStream = await streamObject({
    // ...
  });

  for await (const { partialObject } of objectStream) {
    console.clear();
    console.log(partialObject);
  }
  ```

- **breaking change**: the result from successful `Schema` validations is stored in the `value` property (before: `data`).

## v0.130.1 - 2024-01-22

### Fixed

- Duplex speech streaming works in Vercel Edge Functions.

## v0.130.0 - 2024-01-21

### Changed

- **breaking change**: updated `generateTranscription` interface. The function now takes a `mimeType` and `audioData` (base64-encoded string, `Uint8Array`, `Buffer` or `ArrayBuffer`). Example:

  ```ts
  import { generateTranscription, openai } from "modelfusion";
  import fs from "node:fs";

  const transcription = await generateTranscription({
    model: openai.Transcriber({ model: "whisper-1" }),
    mimeType: "audio/mp3",
    audioData: await fs.promises.readFile("data/test.mp3"),
  });
  ```

- Images in instruction and chat prompts can be `Buffer` or `ArrayBuffer` instances (in addition to base64-encoded strings and `Uint8Array` instances).

## v0.129.0 - 2024-01-20

### Changed

- **breaking change**: Usage of Node `async_hooks` has been renamed from `node:async_hooks` to `async_hooks` for easier Webpack configuration. To exclude the `async_hooks` from client-side bundling, you can use the following config for Next.js (`next.config.mjs` or `next.config.js`):

  ```js
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    webpack: (config, { isServer }) => {
      if (isServer) {
        return config;
      }

      config.resolve = config.resolve ?? {};
      config.resolve.fallback = config.resolve.fallback ?? {};

      // async hooks is not available in the browser:
      config.resolve.fallback.async_hooks = false;

      return config;
    },
  };
  ```

## v0.128.0 - 2024-01-20

### Changed

- **breaking change**: ModelFusion uses `Uint8Array` instead of `Buffer` for better cross-platform compatibility (see also ["Goodbye, Node.js Buffer"](https://sindresorhus.com/blog/goodbye-nodejs-buffer)). This can lead to breaking changes in your code if you use `Buffer`-specific methods.
- **breaking change**: Image content in multi-modal instruction and chat inputs (e.g. for GPT Vision) is passed in the `image` property (instead of `base64Image`) and supports both base64 strings and `Uint8Array` inputs:

  ```ts
  const image = fs.readFileSync(path.join("data", "example-image.png"));

  const textStream = await streamText({
    model: openai.ChatTextGenerator({
      model: "gpt-4-vision-preview",
      maxGenerationTokens: 1000,
    }),

    prompt: [
      openai.ChatMessage.user([
        { type: "text", text: "Describe the image in detail:\n\n" },
        { type: "image", image, mimeType: "image/png" },
      ]),
    ],
  });
  ```

- OpenAI-compatible providers with predefined API configurations have a customized provider name that shows up in the events.

## v0.127.0 - 2024-01-15

### Changed

- **breaking change**: `streamStructure` returns an async iterable over deep partial objects. If you need to get the fully validated final result, you can use the `fullResponse: true` option and await the `structurePromise` value. Example:

  ```ts
  const { structureStream, structurePromise } = await streamStructure({
    model: ollama
      .ChatTextGenerator({
        model: "openhermes2.5-mistral",
        maxGenerationTokens: 1024,
        temperature: 0,
      })
      .asStructureGenerationModel(jsonStructurePrompt.text()),

    schema: zodSchema(
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

    prompt:
      "Generate 3 character descriptions for a fantasy role playing game.",

    fullResponse: true,
  });

  for await (const partialStructure of structureStream) {
    console.clear();
    console.log(partialStructure);
  }

  const structure = await structurePromise;

  console.clear();
  console.log("FINAL STRUCTURE");
  console.log(structure);
  ```

- **breaking change**: Renamed `text` value in `streamText` with `fullResponse: true` to `textPromise`.

### Fixed

- Ollama streaming.
- Ollama structure generation and streaming.

## v0.126.0 - 2024-01-15

### Changed

- **breaking change**: rename `useTool` to `runTool` and `useTools` to `runTools` to avoid confusion with React hooks.

## v0.125.0 - 2024-01-14

### Added

- Perplexity AI chat completion support. Example:

  ```ts
  import { openaicompatible, streamText } from "modelfusion";

  const textStream = await streamText({
    model: openaicompatible
      .ChatTextGenerator({
        api: openaicompatible.PerplexityApi(),
        provider: "openaicompatible-perplexity",
        model: "pplx-70b-online", // online model with access to web search
        maxGenerationTokens: 500,
      })
      .withTextPrompt(),

    prompt: "What is RAG in AI?",
  });
  ```

## v0.124.0 - 2024-01-13

### Added

- [Embedding-support for OpenAI-compatible providers](https://modelfusion.dev/integration/model-provider/openaicompatible/#embed-text). You can for example use the Together AI embedding endpoint:

  ```ts
  import { embed, openaicompatible } from "modelfusion";

  const embedding = await embed({
    model: openaicompatible.TextEmbedder({
      api: openaicompatible.TogetherAIApi(),
      provider: "openaicompatible-togetherai",
      model: "togethercomputer/m2-bert-80M-8k-retrieval",
    }),
    value: "At first, Nox didn't know what to do with the pup.",
  });
  ```

## v0.123.0 - 2024-01-13

### Added

- `classify` model function ([docs](https://modelfusion.dev/guide/function/classify)) for classifying values. The `SemanticClassifier` has been renamed to `EmbeddingSimilarityClassifier` and can be used in conjunction with `classify`:

  ```ts
  import { classify, EmbeddingSimilarityClassifier, openai } from "modelfusion";

  const classifier = new EmbeddingSimilarityClassifier({
    embeddingModel: openai.TextEmbedder({ model: "text-embedding-ada-002" }),
    similarityThreshold: 0.82,
    clusters: [
      {
        name: "politics" as const,
        values: [
          "they will save the country!",
          // ...
        ],
      },
      {
        name: "chitchat" as const,
        values: [
          "how's the weather today?",
          // ...
        ],
      },
    ],
  });

  // strongly typed result:
  const result = await classify({
    model: classifier,
    value: "don't you love politics?",
  });
  ```

## v0.122.0 - 2024-01-13

### Changed

- **breaking change**: Switch from positional parameters to named parameters (parameter object) for all model and tool functions. The parameter object is the first and only parameter of the function. Additional options (last parameter before) are now part of the parameter object. Example:

  ```ts
  // old:
  const text = await generateText(
    openai
      .ChatTextGenerator({
        model: "gpt-3.5-turbo",
        maxGenerationTokens: 1000,
      })
      .withTextPrompt(),

    "Write a short story about a robot learning to love",

    {
      functionId: "example-function",
    }
  );

  // new:
  const text = await generateText({
    model: openai
      .ChatTextGenerator({
        model: "gpt-3.5-turbo",
        maxGenerationTokens: 1000,
      })
      .withTextPrompt(),

    prompt: "Write a short story about a robot learning to love",

    functionId: "example-function",
  });
  ```

  This change was made to make the API more flexible and to allow for future extensions.

## v0.121.2 - 2024-01-11

### Fixed

- Ollama response schema for repeated calls with Ollama 0.1.19 completion models. Thanks [@Necmttn](https://github.com/Necmttn) for the bugfix!

## v0.121.1 - 2024-01-10

### Fixed

- Ollama response schema for repeated calls with Ollama 0.1.19 chat models. Thanks [@jakedetels](https://github.com/jakedetels) for the bug report!

## v0.121.0 - 2024-01-09

### Added

- Synthia prompt template

### Changed

- **breaking change**: Renamed `parentCallId` function parameter to `callId` to enable options pass-through.
- Better output filtering for `detailed-object` log format (e.g. via `modelfusion.setLogFormat("detailed-object")`)

## v0.120.0 - 2024-01-09

### Added

- `OllamaCompletionModel` supports setting the prompt template in the settings. Prompt formats are available under `ollama.prompt.*`. You can then call `.withTextPrompt()`, `.withInstructionPrompt()` or `.withChatPrompt()` to use a standardized prompt.

  ```ts
  const model = ollama
    .CompletionTextGenerator({
      model: "mistral",
      promptTemplate: ollama.prompt.Mistral,
      raw: true, // required when using custom prompt template
      maxGenerationTokens: 120,
    })
    .withTextPrompt();
  ```

### Removed

- **breaking change**: removed `.withTextPromptTemplate` on `OllamaCompletionModel`.

## v0.119.1 - 2024-01-08

### Fixed

- Incorrect export. Thanks [@mloenow](https://github.com/mloenow) for the fix!

## v0.119.0 - 2024-01-07

### Added

- Schema-specific GBNF grammar generator for `LlamaCppCompletionModel`. When using `jsonStructurePrompt`, it automatically uses a GBNF grammar for the JSON schema that you provide. Example:

  ```ts
  const structure = await generateStructure(
    llamacpp
      .CompletionTextGenerator({
        // run openhermes-2.5-mistral-7b.Q4_K_M.gguf in llama.cpp
        promptTemplate: llamacpp.prompt.ChatML,
        maxGenerationTokens: 1024,
        temperature: 0,
      })
      // automatically restrict the output to your schema using GBNF:
      .asStructureGenerationModel(jsonStructurePrompt.text()),

    zodSchema(
      z.array(
        z.object({
          name: z.string(),
          class: z
            .string()
            .describe("Character class, e.g. warrior, mage, or thief."),
          description: z.string(),
        })
      )
    ),

    "Generate 3 character descriptions for a fantasy role playing game. "
  );
  ```

## v0.118.0 - 2024-01-07

### Added

- `LlamaCppCompletionModel` supports setting the prompt template in the settings. Prompt formats are available under `llamacpp.prompt.*`. You can then call `.withTextPrompt()`, `.withInstructionPrompt()` or `.withChatPrompt()` to use a standardized prompt.

  ```ts
  const model = llamacpp
    .CompletionTextGenerator({
      // run https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF with llama.cpp
      promptTemplate: llamacpp.prompt.ChatML,
      contextWindowSize: 4096,
      maxGenerationTokens: 512,
    })
    .withChatPrompt();
  ```

### Changed

- **breaking change**: renamed `response` to `rawResponse` when using `fullResponse: true` setting.
- **breaking change**: renamed `llamacpp.TextGenerator` to `llamacpp.CompletionTextGenerator`.

### Removed

- **breaking change**: removed `.withTextPromptTemplate` on `LlamaCppCompletionModel`.

## v0.117.0 - 2024-01-06

### Added

- Predefined Llama.cpp GBNF grammars:

  - `llamacpp.grammar.json`: Restricts the output to JSON.
  - `llamacpp.grammar.jsonArray`: Restricts the output to a JSON array.
  - `llamacpp.grammar.list`: Restricts the output to a newline-separated list where each line starts with `- `.

- Llama.cpp structure generation support:

  ```ts
  const structure = await generateStructure(
    llamacpp
      .TextGenerator({
        // run openhermes-2.5-mistral-7b.Q4_K_M.gguf in llama.cpp
        maxGenerationTokens: 1024,
        temperature: 0,
      })
      .withTextPromptTemplate(ChatMLPrompt.instruction()) // needed for jsonStructurePrompt.text()
      .asStructureGenerationModel(jsonStructurePrompt.text()), // automatically restrict the output to JSON

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

    "Generate 3 character descriptions for a fantasy role playing game. "
  );
  ```

## v0.116.0 - 2024-01-05

### Added

- Semantic classifier. An easy way to determine a class of a text using embeddings. Example:

  ```ts
  import { SemanticClassifier, openai } from "modelfusion";

  const classifier = new SemanticClassifier({
    embeddingModel: openai.TextEmbedder({
      model: "text-embedding-ada-002",
    }),
    similarityThreshold: 0.82,
    clusters: [
      {
        name: "politics" as const,
        values: [
          "isn't politics the best thing ever",
          "why don't you tell me about your political opinions",
          "don't you just love the president",
          "don't you just hate the president",
          "they're going to destroy this country!",
          "they will save the country!",
        ],
      },
      {
        name: "chitchat" as const,
        values: [
          "how's the weather today?",
          "how are things going?",
          "lovely weather today",
          "the weather is horrendous",
          "let's go to the chippy",
        ],
      },
    ],
  });

  console.log(await classifier.classify("don't you love politics?")); // politics
  console.log(await classifier.classify("how's the weather today?")); // chitchat
  console.log(
    await classifier.classify("I'm interested in learning about llama 2")
  ); // null
  ```

## v0.115.0 - 2024-01-05

### Removed

- Anthropic support. Anthropic has a strong stance against open-source models and against non-US AI. I will not support them by providing a ModelFusion integration.

## v0.114.1 - 2024-01-05

### Fixed

- Together AI text generation and text streaming using OpenAI-compatible chat models.

## v0.114.0 - 2024-01-05

### Added

- Custom call header support for APIs. You can pass a `customCallHeaders` function into API configurations to add custom headers. The function is called with `functionType`, `functionId`, `run`, and `callId` parameters. Example for Helicone:

  ```ts
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

- Rudimentary caching support for `generateText`. You can use a `MemoryCache` to store the response of a `generateText` call. Example:

  ```ts
  import { MemoryCache, generateText, ollama } from "modelfusion";

  const model = ollama
    .ChatTextGenerator({ model: "llama2:chat", maxGenerationTokens: 100 })
    .withTextPrompt();

  const cache = new MemoryCache();

  const text1 = await generateText(
    model,
    "Write a short story about a robot learning to love:",
    { cache }
  );

  console.log(text1);

  // 2nd call will use cached response:
  const text2 = await generateText(
    model,
    "Write a short story about a robot learning to love:", // same text
    { cache }
  );

  console.log(text2);
  ```

- `validateTypes` and `safeValidateTypes` helpers that perform type checking of an object against a `Schema` (e.g., a `zodSchema`).

## v0.113.0 - 2024-01-03

[Structure generation](https://modelfusion.dev/guide/function/generate-structure) improvements.

### Added

- `.asStructureGenerationModel(...)` function to `OpenAIChatModel` and `OllamaChatModel` to create structure generation models from chat models.
- `jsonStructurePrompt` helper function to create structure generation models.

### Example

```ts
import {
  generateStructure,
  jsonStructurePrompt,
  ollama,
  zodSchema,
} from "modelfusion";

const structure = await generateStructure(
  ollama
    .ChatTextGenerator({
      model: "openhermes2.5-mistral",
      maxGenerationTokens: 1024,
      temperature: 0,
    })
    .asStructureGenerationModel(jsonStructurePrompt.text()),

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

  "Generate 3 character descriptions for a fantasy role playing game. "
);
```

## v0.112.0 - 2024-01-02

### Changed

- **breaking change**: renamed `useToolsOrGenerateText` to `useTools`
- **breaking change**: renamed `generateToolCallsOrText` to `generateToolCalls`

### Removed

- Restriction on tool names. OpenAI tool calls do not have such a restriction.

## v0.111.0 - 2024-01-01

Reworked API configuration support.

### Added

- All providers now have an `Api` function that you can call to create custom API configurations. The base URL set up is more flexible and allows you to override parts of the base URL selectively.
- `api` namespace with retry and throttle configurations

### Changed

- Updated Cohere models.
- Updated LMNT API calls to LMNT `v1` API.
- **breaking change**: Renamed `throttleUnlimitedConcurrency` to `throttleOff`.

## v0.110.0 - 2023-12-30

### Changed

- **breaking change**: renamed `modelfusion/extension` to `modelfusion/internal`. This requires updating `modelfusion-experimental` (if used) to `v0.3.0`

### Removed

- Deprecated OpenAI completion models that will be deactivated on January 4, 2024.

## v0.109.0 - 2023-12-30

### Added

- [Open AI compatible completion model](https://modelfusion.dev/integration/model-provider/openaicompatible/). It e.g. works with Fireworks AI.
- Together AI API configuration (for Open AI compatible chat models):

  ```ts
  import {
    TogetherAIApiConfiguration,
    openaicompatible,
    streamText,
  } from "modelfusion";

  const textStream = await streamText(
    openaicompatible
      .ChatTextGenerator({
        api: new TogetherAIApiConfiguration(),
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      })
      .withTextPrompt(),

    "Write a story about a robot learning to love"
  );
  ```

- Updated Llama.cpp model settings. GBNF grammars can be passed into the `grammar` setting:

  ```ts
  const text = await generateText(
    llamacpp
      .TextGenerator({
        maxGenerationTokens: 512,
        temperature: 0,
        // simple list grammar:
        grammar: `root ::= ("- " item)+
  item ::= [^\\n]+ "\\n"`,
      })
      .withTextPromptTemplate(MistralInstructPrompt.text()),

    "List 5 ingredients for a lasagna:\n\n"
  );
  ```

## v0.107.0 - 2023-12-29

### Added

- Mistral instruct prompt template

### Changed

- **breaking change**: Renamed `LlamaCppTextGenerationModel` to `LlamaCppCompletionModel`.

### Fixed

- Updated `LlamaCppCompletionModel` to the latest llama.cpp version.
- Fixed formatting of system prompt for chats in Llama2 2 prompt template.

## v0.106.0 - 2023-12-28

Experimental features that are unlikely to become stable before v1.0 have been moved to a separate `modelfusion-experimental` package.

### Removed

- Cost calculation
- `guard` function
- Browser and server features (incl. flow)
- `summarizeRecursively` function

## v0.105.0 - 2023-12-26

### Added

- Tool call support for chat prompts. Assistant messages can contain tool calls, and tool messages can contain tool call results. Tool calls can be used to implement e.g. agents:

  ```ts
  const chat: ChatPrompt = {
    system: "You are ...",
    messages: [ChatMessage.user({ text: instruction })],
  };

  while (true) {
    const { text, toolResults } = await useToolsOrGenerateText(
      openai
        .ChatTextGenerator({ model: "gpt-4-1106-preview" })
        .withChatPrompt(),
      tools, // array of tools
      chat
    );

    // add the assistant and tool messages to the chat:
    chat.messages.push(
      ChatMessage.assistant({ text, toolResults }),
      ChatMessage.tool({ toolResults })
    );

    if (toolResults == null) {
      return; // no more actions, break loop
    }

    // ... (handle tool results)
  }
  ```

- `streamText` returns a `text` promise when invoked with `fullResponse: true`. After the streaming has finished, the promise resolves with the full text.

  ```ts
  const { text, textStream } = await streamText(
    openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }).withTextPrompt(),
    "Write a short story about a robot learning to love:",
    { fullResponse: true }
  );

  // ... (handle streaming)

  console.log(await text); // full text
  ```

## v0.104.0 - 2023-12-24

### Changed

- **breaking change**: Unified text and multimodal prompt templates. `[Text/MultiModal]InstructionPrompt` is now `InstructionPrompt`, and `[Text/MultiModalChatPrompt]` is now `ChatPrompt`.
- More flexible chat prompts: The chat prompt validation is now chat template specific and validated at runtime. E.g. the Llama2 prompt template only supports turns of user and assistant messages, whereas other formats are more flexible.

## v0.103.0 - 2023-12-23

### Added

- `finishReason` support for `generateText`.

  The finish reason can be `stop` (the model stopped because it generated a stop sequence), `length` (the model stopped because it generated the maximum number of tokens), `content-filter` (the model stopped because the content filter detected a violation), `tool-calls` (the model stopped because it triggered a tool call), `error` (the model stopped because of an error), `other` (the model stopped for another reason), or `unknown` (the model stop reason is not know or the model does not support finish reasons).

  You can extract it from the full response when using `fullResponse: true`:

  ```ts
  const { text, finishReason } = await generateText(
    openai
      .ChatTextGenerator({ model: "gpt-3.5-turbo", maxGenerationTokens: 200 })
      .withTextPrompt(),
    "Write a short story about a robot learning to love:",
    { fullResponse: true }
  );
  ```

## v0.102.0 - 2023-12-22

### Added

- You can specify `numberOfGenerations` on image generation models and create multiple images by using the `fullResponse: true` option. Example:

  ```ts
  // generate 2 images:
  const { images } = await generateImage(
    openai.ImageGenerator({
      model: "dall-e-3",
      numberOfGenerations: 2,
      size: "1024x1024",
    }),
    "the wicked witch of the west in the style of early 19th century painting",
    { fullResponse: true }
  );
  ```

- **breaking change**: Image generation models use a generalized `numberOfGenerations` parameter (instead of model specific parameters) to specify the number of generations.

## v0.101.0 - 2023-12-22

### Changed

- Automatic1111 Stable Diffusion Web UI configuration has separate configuration of host, port, and path.

### Fixed

- Automatic1111 Stable Diffusion Web UI uses negative prompt and seed.

## v0.100.0 - 2023-12-17

### Added

- `ollama.ChatTextGenerator` model that calls the Ollama chat API.
- Ollama chat messages and prompts are exposed through `ollama.ChatMessage` and `ollama.ChatPrompt`
- OpenAI chat messages and prompts are exposed through `openai.ChatMessage` and `openai.ChatPrompt`
- Mistral chat messages and prompts are exposed through `mistral.ChatMessage` and `mistral.ChatPrompt`

### Changed

- **breaking change**: renamed `ollama.TextGenerator` to `ollama.CompletionTextGenerator`
- **breaking change**: renamed `mistral.TextGenerator` to `mistral.ChatTextGenerator`

## v0.99.0 - 2023-12-16

### Added

- You can specify `numberOfGenerations` on text generation models and access multiple generations by using the `fullResponse: true` option. Example:

  ```ts
  // generate 2 texts:
  const { texts } = await generateText(
    openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      numberOfGenerations: 2,
      maxGenerationTokens: 1000,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { fullResponse: true }
  );
  ```

- **breaking change**: Text generation models use a generalized `numberOfGenerations` parameter (instead of model specific parameters) to specify the number of generations.

### Changed

- **breaking change**: Renamed `maxCompletionTokens` text generation model setting to `maxGenerationTokens`.

## v0.98.0 - 2023-12-16

### Changed

- **breaking change**: `responseType` option was changed into `fullResponse` option and uses a boolean value to make discovery easy. The response values from the full response have been renamed for clarity. For base64 image generation, you can use the `imageBase64` value from the full response:

  ```ts
  const { imageBase64 } = await generateImage(model, prompt, {
    fullResponse: true,
  });
  ```

### Improved

- Better docs for the OpenAI chat settings. Thanks [@bearjaws](https://github.com/bearjaws) for the contribution!

### Fixed

- Streaming OpenAI chat text generation when setting `n:2` or higher returns only the stream from the first choice.

## v0.97.0 - 2023-12-14

### Added

- **breaking change**: Ollama image (vision) support. This changes the Ollama prompt format. You can add `.withTextPrompt()` to existing Ollama text generators to get a text prompt like before.

  Vision example:

  ```ts
  import { ollama, streamText } from "modelfusion";

  const textStream = await streamText(
    ollama.TextGenerator({
      model: "bakllava",
      maxCompletionTokens: 1024,
      temperature: 0,
    }),
    {
      prompt: "Describe the image in detail",
      images: [image], // base-64 encoded png or jpeg
    }
  );
  ```

### Changed

- **breaking change**: Switch Ollama settings to camelCase to align with the rest of the library.

## v0.96.0 - 2023-12-14

### Added

- [Mistral platform support](https://modelfusion.dev/integration/model-provider/mistral)

## v0.95.0 - 2023-12-10

### Added

- `cachePrompt` parameter for llama.cpp models. Thanks [@djwhitt](https://github.com/djwhitt) for the contribution!

## v0.94.0 - 2023-12-10

### Added

- Prompt template for neural-chat models.

## v0.93.0 - 2023-12-10

### Added

- Optional response prefix for instruction prompts to guide the LLM response.

### Changed

- **breaking change**: Renamed prompt format to prompt template to align with the commonly used language (e.g. from model cards).

## v0.92.1 - 2023-12-10

### Changed

- Improved Ollama error handling.

## v0.92.0 - 2023-12-09

### Changed

- **breaking change**: setting global function observers and global logging has changed.
  You can call methods on a `modelfusion` import:

  ```ts
  import { modelfusion } from "modelfusion";

  modelfusion.setLogFormat("basic-text");
  ```

- Cleaned output when using `detailed-object` log format.

## v0.91.0 - 2023-12-09

### Added

- `Whisper.cpp` [transcription (speech-to-text) model](https://modelfusion.dev/integration/model-provider/whispercpp) support.

  ```ts
  import { generateTranscription, whispercpp } from "modelfusion";

  const data = await fs.promises.readFile("data/test.wav");

  const transcription = await generateTranscription(whispercpp.Transcriber(), {
    type: "wav",
    data,
  });
  ```

### Improved

- Better error reporting.

## v0.90.0 - 2023-12-03

### Added

- Temperature and language settings to OpenAI transcription model.

## v0.89.0 - 2023-11-30

### Added

- `maxValuesPerCall` setting for `OpenAITextEmbeddingModel` to enable different configurations, e.g. for Azure. Thanks [@nanotronic](https://github.com/nanotronic) for the contribution!

## v0.88.0 - 2023-11-28

### Added

- Multi-modal chat prompts. Supported by OpenAI vision chat models and by BakLLaVA prompt format.

### Changed

- **breaking change**: renamed `ChatPrompt` to `TextChatPrompt` to distinguish it from multi-modal chat prompts.

## v0.87.0 - 2023-11-27

### Added

- **experimental**: `modelfusion/extension` export with functions and classes that are necessary to implement providers in 3rd party node modules. See [lgrammel/modelfusion-example-provider](https://github.com/lgrammel/modelfusion-example-provider) for an example.

## v0.85.0 - 2023-11-26

### Added

- `OpenAIChatMessage` function call support.

## v0.84.0 - 2023-11-26

### Added

- Support for OpenAI-compatible chat APIs. See [OpenAI Compatible](https://modelfusion.dev/integration/model-provider/openaicompatible) for details.

  ```ts
  import {
    BaseUrlApiConfiguration,
    openaicompatible,
    generateText,
  } from "modelfusion";

  const text = await generateText(
    openaicompatible
      .ChatTextGenerator({
        api: new BaseUrlApiConfiguration({
          baseUrl: "https://api.fireworks.ai/inference/v1",
          headers: {
            Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
          },
        }),
        model: "accounts/fireworks/models/mistral-7b",
      })
      .withTextPrompt(),

    "Write a story about a robot learning to love"
  );
  ```

## v0.83.0 - 2023-11-26

### Added

- Introduce `uncheckedSchema()` facade function as an easier way to create unchecked ModelFusion schemas. This aligns the API with `zodSchema()`.

### Changed

- **breaking change**: Renamed `InstructionPrompt` interface to `MultiModalInstructionPrompt` to clearly distinguish it from `TextInstructionPrompt`.
- **breaking change**: Renamed `.withBasicPrompt` methods for image generation models to `.withTextPrompt` to align with text generation models.

## v0.82.0 - 2023-11-25

### Added

- Introduce `zodSchema()` facade function as an easier way to create new ModelFusion Zod schemas. This clearly distinguishes it from `ZodSchema` that is also part of the zod library.

## v0.81.0 - 2023-11-25

**breaking change**: `generateStructure` and `streamStructure` redesign. The new API does not require function calling and `StructureDefinition` objects any more. This makes it more flexible and it can be used in 3 ways:

- with OpenAI function calling:

  ```ts
  const model = openai
    .ChatTextGenerator({ model: "gpt-3.5-turbo" })
    .asFunctionCallStructureGenerationModel({
      fnName: "...",
      fnDescription: "...",
    });
  ```

- with OpenAI JSON format:

  ```ts
  const model = openai
    .ChatTextGenerator({
      model: "gpt-4-1106-preview",
      temperature: 0,
      maxCompletionTokens: 1024,
      responseFormat: { type: "json_object" },
    })
    .asStructureGenerationModel(
      jsonStructurePrompt((instruction: string, schema) => [
        OpenAIChatMessage.system(
          "JSON schema: \n" +
            JSON.stringify(schema.getJsonSchema()) +
            "\n\n" +
            "Respond only using JSON that matches the above schema."
        ),
        OpenAIChatMessage.user(instruction),
      ])
    );
  ```

- with Ollama (and a capable model, e.g., OpenHermes 2.5):
  ```ts
  const model = ollama
    .TextGenerator({
      model: "openhermes2.5-mistral",
      maxCompletionTokens: 1024,
      temperature: 0,
      format: "json",
      raw: true,
      stopSequences: ["\n\n"], // prevent infinite generation
    })
    .withPromptFormat(ChatMLPromptFormat.instruction())
    .asStructureGenerationModel(
      jsonStructurePrompt((instruction: string, schema) => ({
        system:
          "JSON schema: \n" +
          JSON.stringify(schema.getJsonSchema()) +
          "\n\n" +
          "Respond only using JSON that matches the above schema.",
        instruction,
      }))
    );
  ```

See [generateStructure](https://modelfusion.dev/guide/function/generate-structure) for details on the new API.

## v0.80.0 - 2023-11-24

### Changed

- **breaking change**: Restructured multi-modal instruction prompts and `OpenAIChatMessage.user()`

## v0.79.0 - 2023-11-23

### Added

- Multi-tool usage from open source models

  Use `TextGenerationToolCallsOrGenerateTextModel` and related helper methods `.asToolCallsOrTextGenerationModel()` to create custom prompts & parsers.

  Examples:

  - `examples/basic/src/model-provider/ollama/ollama-use-tools-or-generate-text-openhermes-example.ts`
  - `examples/basic/src/model-provider/llamacpp/llamacpp-use-tools-or-generate-text-openhermes-example.ts`

  Example prompt format:

  - `examples/basic/src/tool/prompts/open-hermes.ts` for OpenHermes 2.5

## v0.78.0 - 2023-11-23

### Removed

- **breaking change**: Removed `FunctionListToolCallPromptFormat`. See `examples/basic/src/model-provide/ollama/ollama-use-tool-mistral-example.ts` for how to implement a `ToolCallPromptFormat` for your tool.

## v0.77.0 - 2023-11-23

### Changed

- **breaking change**: Rename `Speech` to `SpeechGenerator` in facades
- **breaking change**: Rename `Transcription` to `Transcriber` in facades

## v0.76.0 - 2023-11-23

### Added

- Anthropic Claude 2.1 support

## v0.75.0 - 2023-11-22

Introducing model provider facades:

```ts
const image = await generateImage(
  openai.ImageGenerator({ model: "dall-e-3", size: "1024x1024" }),
  "the wicked witch of the west in the style of early 19th century painting"
);
```

### Added

- Model provider facades. You can e.g. use `ollama.TextGenerator(...)` instead of `new OllamaTextGenerationModel(...)`.

### Changed

- **breaking change**: Fixed method name `isParallizable` to `isParallelizable` in `EmbeddingModel`.

### Removed

- **breaking change**: removed `HuggingFaceImageDescriptionModel`. Image description models will be replaced by multi-modal vision models.

## v0.74.1 - 2023-11-22

### Improved

- Increase OpenAI chat streaming resilience.

## v0.74.0 - 2023-11-21

Prompt format and tool calling improvements.

### Added

- text prompt format. Use simple text prompts, e.g. with `OpenAIChatModel`:
  ```ts
  const textStream = await streamText(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
    }).withTextPrompt(),
    "Write a short story about a robot learning to love."
  );
  ```
- `.withTextPromptFormat` to `LlamaCppTextGenerationModel` for simplified prompt construction:
  ```ts
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      // ...
    }).withTextPromptFormat(Llama2PromptFormat.text()),
    "Write a short story about a robot learning to love."
  );
  ```
- `.asToolCallGenerationModel()` to `OllamaTextGenerationModel` to simplify tool calls.

### Improved

- better error reporting when using exponent backoff retries

### Removed

- **breaking change**: removed `input` from `InstructionPrompt` (was Alpaca-specific, `AlpacaPromptFormat` still supports it)

## v0.73.1 - 2023-11-19

Remove section newlines from Llama 2 prompt format.

## v0.73.0 - 2023-11-19

Ollama edge case and error handling improvements.

## v0.72.0 - 2023-11-19

**Breaking change**: the tool calling API has been reworked to support multiple parallel tool calls. This required multiple breaking changes (see below). Check out the updated [tools documentation](https://modelfusion.dev/guide/tools/) for details.

### Changed

- `Tool` has `parameters` and `returnType` schemas (instead of `inputSchema` and `outputSchema`).
- `useTool` uses `generateToolCall` under the hood. The return value and error handling has changed.
- `useToolOrGenerateText` has been renamed to `useToolsOrGenerateText`. It uses `generateToolCallsOrText` under the hood. The return value and error handling has changed. It can invoke several tools in parallel and returns an array of tool results.
- The `maxRetries` parameter in `guard` has been replaced by a `maxAttempt` parameter.

### Removed

- `generateStructureOrText` has been removed.

## v0.71.0 - 2023-11-17

### Added

- Experimental generateToolCallsOrText function for generating a multiple parallel tool call using the OpenAI chat/tools API.

## v0.70.0 - 2023-11-16

### Added

- ChatML prompt format.

### Changed

- **breaking change**: `ChatPrompt` structure and terminology has changed to align more closely with OpenAI and similar chat prompts. This is also in preparation for integrating images and function calls results into chat prompts.
- **breaking change**: Prompt formats are namespaced. Use e.g. `Llama2PromptFormat.chat()` instead of `mapChatPromptToLlama2Format()`. See [Prompt Format](https://modelfusion.dev/guide/function/generate-text#prompt-styles) for documentation of the new prompt formats.

## v0.69.0 - 2023-11-15

### Added

- Experimental generateToolCall function for generating a single tool call using the OpenAI chat/tools API.

## v0.68.0 - 2023-11-14

### Changed

- Refactored JSON parsing to use abstracted schemas. You can use `parseJSON` and `safeParseJSON` to securely parse JSON objects and optionally type-check them using any schema (e.g. a Zod schema).

## v0.67.0 - 2023-11-12

### Added

- Ollama 0.1.9 support: `format` (for forcing JSON output) and `raw` settings
- Improved Ollama settings documentation

## v0.66.0 - 2023-11-12

### Added

- Support for fine-tuned OpenAI `gpt-4-0613` models
- Support for `trimWhitespace` model setting in `streamText` calls

## v0.65.0 - 2023-11-12

### Added

- Image support for `OpenAIChatMessage.user`
- `mapInstructionPromptToBakLLaVA1ForLlamaCppFormat` prompt format

### Changed

- **breaking change**: `VisionInstructionPrompt` was replaced by an optional `image` field in `InstructionPrompt`.

## v0.64.0 - 2023-11-11

### Added

- Support for OpenAI vision model.
  - Example: `examples/basic/src/model-provider/openai/openai-chat-stream-text-vision-example.ts`

## v0.63.0 - 2023-11-08

### Added

- Support for OpenAI chat completion `seed` and `responseFormat` options.

## v0.62.0 - 2023-11-08

### Added

- OpenAI speech generation support. Shoutout to [@bjsi](https://github.com/bjsi) for the awesome contribution!

## v0.61.0 - 2023-11-07

### Added

- OpenAI `gpt-3.5-turbo-1106`, `gpt-4-1106-preview`, `gpt-4-vision-preview` chat models.
- OpenAI `Dalle-E-3` image model.

### Changed

- **breaking change**: `OpenAIImageGenerationModel` requires a `model` parameter.

## v0.60.0 - 2023-11-06

### Added

- Support image input for multi-modal Llama.cpp models (e.g. Llava, Bakllava).

### Changed

- **breaking change**: Llama.cpp prompt format has changed to support images. Use `.withTextPrompt()` to get a text prompt format.

## v0.59.0 - 2023-11-06

### Added

- ElevenLabs `eleven_turbo_v2` support.

## v0.58 - 2023-11-05

### Fixed

- **breaking change**: Uncaught errors were caused by custom Promises. ModelFusion uses only standard Promises. To get full responses from model function, you need to use the `{ returnType: "full" }` option instead of calling `.asFullResponse()` on the result.

## v0.57.1 - 2023-11-05

### Improved

- ModelFusion server error logging and reporting.

### Fixed

- ModelFusion server creates directory for runs automatically when errors are thrown.

## v0.57.0 - 2023-11-04

### Added

- Support for [Cohere v3 embeddings](https://txt.cohere.com/introducing-embed-v3/).

## v0.56.0 - 2023-11-04

### Added

- [Ollama model provider](https://modelfusion.dev/integration/model-provider/ollama) for text embeddings.

## v0.55.1 - 2023-11-04

### Fixed

- Llama.cpp embeddings are invoked sequentially to avoid rejection by the server.

## v0.55.0 - 2023-11-04

### Added

- [Ollama model provider](https://modelfusion.dev/integration/model-provider/ollama) for text generation and text streaming.

## v0.54.0 - 2023-10-29

Adding experimental ModelFusion server, flows, and browser utils.

### Added

- ModelFusion server (separate export 'modelfusion/server') with a Fastify plugin for running ModelFusion flows on a server.
- ModelFusion flows.
- ModelFusion browser utils (separate export 'modelfusion/browser') for dealing with audio data and invoking ModelFusion flows on the server (`invokeFlow`).

### Changed

- **breaking change**: `readEventSource` and `readEventSourceStream` are part of 'modelfusion/browser'.

## v0.53.2 - 2023-10-26

### Added

- Prompt callback option for `streamStructure`

### Improved

- Inline JSDoc comments for the model functions.

## v0.53.1 - 2023-10-25

### Fixed

- Abort signals and errors during streaming are caught and forwarded correctly.

## v0.53.0 - 2023-10-23

### Added

- `executeFunction` utility function for tracing execution time, parameters, and result of composite functions and non-ModelFusion functions.

## v0.52.0 - 2023-10-23

### Changed

- Streaming results and `AsyncQueue` objects can be used by several consumers. Each consumer will receive all values. This means that you can e.g. forward the same text stream to speech generation and the client.

## v0.51.0 - 2023-10-23

ElevenLabs improvements.

### Added

- ElevenLabs model settings `outputFormat` and `optimizeStreamingLatency`.

### Fixed

- Default ElevenLabs model is `eleven_monolingual_v1`.

## v0.50.0 - 2023-10-22

### Added

- `parentCallId` event property
- Tracing for `useTool`, `useToolOrGenerateText`, `upsertIntoVectorIndex`, and `guard`

### Changed

- **breaking change**: rename `embedding` event type to `embed`
- **breaking change**: rename `image-generation` event type to `generate-image`
- **breaking change**: rename `speech-generation` event type to `generate-speech`
- **breaking change**: rename `speech-streaming` event type to `stream-speech`
- **breaking change**: rename `structure-generation` event type to `generate-structure`
- **breaking change**: rename `structure-or-text-generation` event type to `generate-structure-or-text`
- **breaking change**: rename `structure-streaming` event type to `stream-structure`
- **breaking change**: rename `text-generation` event type to `generate-text`
- **breaking change**: rename `text-streaming` event type to `stream-text`
- **breaking change**: rename `transcription` event type to `generate-transcription`

## v0.49.0 - 2023-10-21

### Added

- Speech synthesis streaming supports string inputs.
- Observability for speech synthesis streaming.

### Changed

- **breaking change**: split `synthesizeSpeech` into `generateSpeech` and `streamSpeech` functions
- **breaking change**: renamed `speech-synthesis` event to `speech-generation`
- **breaking change**: renamed `transcribe` to `generateTranscription`
- **breaking change**: renamed `LmntSpeechSynthesisModel` to `LmntSpeechModel`
- **breaking change**: renamed `ElevenLabesSpeechSynthesisModel` to `ElevenLabsSpeechModel`
- **breaking change**: renamed `OpenAITextGenerationModel` to `OpenAICompletionModel`

### Removed

- **breaking change**: `describeImage` model function. Use `generateText` instead (with e.g. `HuggingFaceImageDescriptionModel`).

## v0.48.0 - 2023-10-20

### Added

- Duplex streaming for speech synthesis.
- Elevenlabs duplex streaming support.

### Changed

- Schema is using data in return type (breaking change for tools).

## v0.47.0 - 2023-10-14

### Added

- Prompt formats for image generation. You can use `.withPromptFormat()` or `.withBasicPrompt()` to apply a prompt format to an image generation model.

### Changed

- **breaking change**: `generateImage` returns a Buffer with the binary image data instead of a base-64 encoded string. You can call `.asBase64Text()` on the response to get a base64 encoded string.

## v0.46.0 - 2023-10-14

### Added

- `.withChatPrompt()` and `.withInstructionPrompt()` shorthand methods.

## v0.45.0 - 2023-10-14

### Changed

- Updated Zod to 3.22.4. You need to use Zod 3.22.4 or higher in your project.

## v0.44.0 - 2023-10-13

### Added

- Store runs in AsyncLocalStorage for convienience (Node.js only).

## v0.43.0 - 2023-10-12

### Added

- Guard function.

## v0.42.0 - 2023-10-11

### Added

- Anthropic model support (Claude 2, Claude instant).

## v0.41.0 - 2023-10-05

### Changed

**breaking change**: generics simplification to enable dynamic model usage. Models can be used more easily as function parameters.

- `output` renamed to `value` in `asFullResponse()`
- model settings can no longer be configured as a model options parameter. Use `.withSettings()` instead.

## v0.40.0 - 2023-10-04

### Changed

**breaking change**: moved Pinecone integration into `@modelfusion/pinecone` module.

## v0.39.0 - 2023-10-03

### Added

- `readEventSource` for parsing a server-sent event stream using the JavaScript EventSource.

### Changed

**breaking change**: generalization to use Schema instead of Zod.

- `MemoryVectorIndex.deserialize` requires a `Schema`, e.g. `new ZodSchema` (from ModelFusion).
- `readEventSourceStream` requires a `Schema`.
- `UncheckedJsonSchema[Schema/StructureDefinition]` renamed to `Unchecked[Schema/StructureDefinition]`.

## v0.38.0 - 2023-10-02

### Changed

**breaking change**: Generalized embeddings beyond text embedding.

- `embedText` renamed to `embed`.
- `embedTexts` renamed to `embedMany`
- Removed filtering from `VectorIndexRetriever` query (still available as a setting).

## v0.37.0 - 2023-10-02

### Added

- `VectorIndexRetriever` supports a filter option that is passed to the vector index.
- `MemoryVectorIndex` supports filter functions that are applied to the objects before calculating the embeddings.

## v0.36.0 - 2023-10-02

### Added

- `basic-text` logger logs function ids when available.
- `retrieve` produces events for logging and observability.

## v0.35.2 - 2023-09-27

### Fixed

- Support empty stop sequences when calling OpenAI text and chat models.

## v0.35.1 - 2023-09-27

### Fixed

- Fixed bugs in `streamStructure` partial JSON parsing.

## v0.35.0 - 2023-09-26

### Added

- `streamStructure` for streaming structured responses, e.g. from OpenAI function calls. Thanks [@bjsi](https://github.com/bjsi) for the input!

## v0.34.0 - 2023-09-25

### Added

- First version of event source utilities: `AsyncQueue`, `createEventSourceStream`, `readEventSourceStream`.

## v0.33.1 - 2023-09-24

### Fixed

- Remove resolution part from type definitions.

## v0.33.0 - 2023-09-19

### Changed

**breaking change**: Generalized vector store upsert/retrieve beyond text chunks:

- `upsertTextChunks` renamed to `upsertIntoVectorStore`. Syntax has changed.
- `retrieveTextChunks` renamed to `retrieve`
- `SimilarTextChunksFromVectorIndexRetriever` renamed to `VectorIndexRetriever`

## v0.32.0 - 2023-09-19

### Added

- OpenAI gpt-3.5-turbo-instruct model support.
- Autocomplete for Stability AI models (thanks [@Danielwinkelmann](https://github.com/Danielwinkelmann)!)

### Changed

- Downgrade Zod version to 3.21.4 because of https://github.com/colinhacks/zod/issues/2697

## v0.31.0 - 2023-09-13

### Changed

- **breaking change**: Renamed chat format construction functions to follow the pattern `map[Chat|Instruction]PromptTo[FORMAT]Format()`, e.g. `mapInstructionPromptToAlpacaFormat()`, for easy auto-completion.

### Removed

- **breaking change**: The prompts for `generateStructure` and `generateStructureOrText` have been simplified. You can remove the `OpenAIChatPrompt.forStructureCurried` (and similar) parts.

## v0.30.0 - 2023-09-10

### Added

- You can directly pass JSON schemas into `generateStructure` and `generateStructureOrText` calls without validation using `UncheckedJsonSchemaStructureDefinition`. This is useful when you need more flexility and don't require type inference. See `examples/basic/src/util/schema/generate-structure-unchecked-json-schema-example.ts`.

### Changed

- **BREAKING CHANGE**: renamed `generateJson` and `generateJsonOrText` to `generateStructure` and `generateStructureOrText`.
- **BREAKING CHANGE**: introduced `ZodSchema` and `ZodStructureDefinition`. These are required for `generateStructure` and `generateStructureOrText` calls and in tools.
- **BREAKING CHANGE**: renamed the corresponding methods and objects.

Why this breaking change?

ModelFusion is currently tied to Zod, but there are many other type checking libraries out there, and Zod does not map perfectly to JSON Schema (which is used in OpenAI function calling).
Enabling you to use JSON Schema directly in ModelFusion is a first step towards decoupling ModelFusion from Zod.
You can also configure your own schema adapters that e.g. use Ajv or another library.
Since this change already affected all JSON generation calls and tools, I included other changes that I had planned in the same area (e.g., renaming to generateStructure and making it more consistent).

## v0.29.0 - 2023-09-09

### Added

- `describeImage` model function for image captioning and OCR. HuggingFace provider available.

## v0.28.0 - 2023-09-09

### Added

- BaseUrlApiConfiguration class for setting up API configurations with custom base URLs and headers.

## v0.27.0 - 2023-09-07

### Added

- Support for running OpenAI on Microsoft Azure.

### Changed

- **Breaking change**: Introduce API configuration. This affects setting the baseUrl, throttling, and retries.
- Improved Helicone support via `HeliconeOpenAIApiConfiguration`.

## v0.26.0 - 2023-09-06

### Added

- LMNT speech synthesis support.

## v0.25.0 - 2023-09-05

### Changed

- Separated cost calculation from Run.

## v0.24.1 - 2023-09-04

### Added

- Exposed `logitBias` setting for OpenAI chat and text generation models.

## v0.24.0 - 2023-09-02

### Added

- Support for fine-tuned OpenAI models (for the `davinci-002`, `babbage-002`, and `gpt-3.5-turbo` base models).

## v0.23.0 - 2023-08-31

### Added

- Function logging support.
- Usage information for events.
- Filtering of model settings for events.

## v0.22.0 - 2023-08-28

### Changed

- **Breaking change**: Restructured the function call events.

## v0.21.0 - 2023-08-26

### Changed

- **Breaking change**: Reworked the function observer system. See [Function observers](https://modelfusion.dev/guide/util/observer) for details on how to use the new system.

## v0.20.0 - 2023-08-24

### Changed

- **Breaking change**: Use `.asFullResponse()` to get full responses from model functions (replaces the `fullResponse: true` option).

## v0.19.0 - 2023-08-23

### Added

- Support for "babbage-002" and "davinci-002" OpenAI base models.

### Fixed

- Choose correct tokenizer for older OpenAI text models.

## v0.18.0 - 2023-08-22

### Added

- Support for ElevenLabs speech synthesis parameters.

## v0.17.0 - 2023-08-21

### Added

- `generateSpeech` function to generate speech from text.
- ElevenLabs support.

## v0.15.0 - 2023-08-21

### Changed

- Introduced unified `stopSequences` and `maxCompletionTokens` properties for all text generation models. **Breaking change**: `maxCompletionTokens` and `stopSequences` are part of the base TextGenerationModel. Specific names for these properties in models have been replaced by this, e.g. `maxTokens` in OpenAI models is `maxCompletionTokens`.

## v0.14.0 - 2023-08-17

### Changed

- **Breaking change**: Renamed prompt mappings (and related code) to prompt format.
- Improved type inference for WebSearchTool and executeTool.

## v0.12.0 - 2023-08-15

### Added

- JsonTextGenerationModel and InstructionWithSchemaPrompt to support generateJson on text generation models.

## v0.11.0 - 2023-08-14

### Changed

- WebSearchTool signature updated.

## v0.10.0 - 2023-08-13

### Added

- Convenience functions to create OpenAI chat messages from tool calls and results.

## v0.9.0 - 2023-08-13

### Added

- `WebSearchTool` definition to support the SerpAPI tool (separate package: `@modelfusion/serpapi-tools`)

## v0.8.0 - 2023-08-12

### Added

- `executeTool` function that directly executes a single tool and records execution metadata.

### Changed

- Reworked event system and introduced RunFunctionEvent.

## v0.7.0 - 2023-08-10

### Changed

- **Breaking change**: Model functions return a simple object by default to make the 95% use case easier. You can use the `fullResponse` option to get a richer response object that includes the original model response and metadata.

## v0.6.0 - 2023-08-07

### Added

- `splitTextChunk` function.

### Changed

- **Breaking change**: Restructured text splitter functions.

## v0.5.0 - 2023-08-07

### Added

- `splitTextChunks` function.
- Chat with PDF demo.

### Changed

- **Breaking change**: Renamed VectorIndexSimilarTextChunkRetriever to SimilarTextChunksFromVectorIndexRetriever.
- **Breaking change**: Renamed 'content' property in TextChunk to 'text.

### Removed

- `VectorIndexTextChunkStore`

## v0.4.1 - 2023-08-06

### Fixed

- Type inference bug in `trimChatPrompt`.

## v0.4.0 - 2023-08-06

### Added

- HuggingFace text embedding support.

## v0.3.0 - 2023-08-05

### Added

- Helicone observability integration.

## v0.2.0 - 2023-08-04

### Added

- Instruction prompts can contain optional `input` property.
- Alpaca instruction prompt mapping.
- Vicuna chat prompt mapping.

## v0.1.1 - 2023-08-02

### Changed

- Docs updated to ModelFusion.

## v0.1.0 - 2023-08-01

### Changed

- **Breaking Change**: Renamed to `modelfusion` (from `ai-utils.js`).

## v0.0.43 - 2023-08-01

### Changed

- **Breaking Change**: model functions return rich objects that include the result, the model response and metadata. This enables you to access the original model response easily when you need it and also use the metadata outside of runs.

## v0.0.42 - 2023-07-31

### Added

- `trimChatPrompt()` function to fit chat prompts into the context window and leave enough space for the completion.
- `maxCompletionTokens` property on TextGenerationModels.

### Changed

- Renamed `withMaxTokens` to `withMaxCompletionTokens` on TextGenerationModels.

### Removed

- `composeRecentMessagesOpenAIChatPrompt` function (use `trimChatPrompt` instead).

## v0.0.41 - 2023-07-30

### Added

- ChatPrompt concept (with chat prompt mappings for text, OpenAI chat, and Llama 2 prompts).

### Changed

- Renamed prompt mappings and changed into functions.

## v0.0.40 - 2023-07-30

### Added

- Prompt mapping support for text generation and streaming.
- Added instruction prompt concept and mapping.
- Option to specify context window size for Llama.cpp text generation models.

### Changed

- Renamed 'maxTokens' to 'contextWindowSize' where applicable.
- Restructured how tokenizers are exposed by text generation models.

## v0.0.39 - 2023-07-26

### Added

- llama.cpp embedding support.

## v0.0.38 - 2023-07-24

### Changed

- `zod` and `zod-to-json-schema` are peer dependencies and no longer included in the package.

## v0.0.37 - 2023-07-23

### Changed

- `generateJsonOrText`, `useToolOrGenerateText`, `useTool` return additional information in the response (e.g. the parameters and additional text).

## v0.0.36 - 2023-07-23

### Changed

- Renamed `callTool` to `useTool` and `callToolOrGenerateText` to `useToolOrGenerateText`.

## v0.0.35 - 2023-07-22

### Added

- `generateJsonOrText`
- Tools: `Tool` class, `callTool`, `callToolOrGenerateText`

### Changed

- Restructured "generateJson" arguments.

## v0.0.34 - 2023-07-18

### Removed

- `asFunction` model function variants. Use JavaScript lamba functions instead.

## v0.0.33 - 2023-07-18

### Added

- OpenAIChatAutoFunctionPrompt to call the OpenAI functions API with multiple functions in 'auto' mode.

## v0.0.32 - 2023-07-15

### Changed

- Changed the prompt format of the generateJson function.

## v0.0.31 - 2023-07-14

### Changed

- Reworked interaction with vectors stores. Removed VectorDB, renamed VectorStore to VectorIndex, and introduced upsertTextChunks and retrieveTextChunks functions.

## v0.0.30 - 2023-07-13

### Fixed

- Bugs related to performance. not being available.

## v0.0.29 - 2023-07-13

### Added

- Llama.cpp tokenization support.

### Changed

- Split Tokenizer API into BasicTokenizer and FullTokenizer.
- Introduce countTokens function (replacing Tokenizer.countTokens).

## v0.0.28 - 2023-07-12

### Added

- Events for streamText.

## v0.0.27 - 2023-07-11

### Added

- TextDeltaEventSource for Client/Server streaming support.

### Fixed

- End-of-stream bug in Llama.cpp text streaming.

## v0.0.26 - 2023-07-11

### Added

- Streaming support for Cohere text generation models.

## v0.0.25 - 2023-07-10

### Added

- Streaming support for OpenAI text completion models.
- OpenAI function streaming support (in low-level API).

## v0.0.24 - 2023-07-09

### Added

- Generalized text streaming (async string iterable, useful for command line streaming).
- Streaming support for Llama.cpp text generation.

## v0.0.23 - 2023-07-08

### Added

- Llama.cpp text generation support.

## v0.0.22 - 2023-07-08

### Changed

- Convert all main methods (e.g. `model.generateText(...)`) to a functional API (i.e., `generateText(model, ...)`).

## v0.0.21 - 2023-07-07

### New

- JSON generation model.

## v0.0.20 - 2023-07-02

### New

- Automatic1111 image generation provider.

## v0.0.19 - 2023-06-30

### New

- Cost calculation for OpenAI image generation and transcription models.

## v0.0.18 - 2023-06-28

### New

- Cost calculation for Open AI text generation, chat and embedding models.

### Changed

- Renamed RunContext to Run. Introduced DefaultRun.
- Changed events and observers.

## v0.0.17 - 2023-06-14

### New

1. Updated OpenAI models.
1. Low-level support for OpenAI chat functions API (via `OpenAIChatModel.callApi`).
1. TranscriptionModel and OpenAITranscriptionModel (using `whisper`)

### Changed

1. Single optional parameter for functions/method that contains run, functionId, etc.

## v0.0.16 - 2023-06-13

### Fixed

1. Retry is not attempted when you ran out of OpenAI credits.
1. Vercel edge function support (switched to nanoid for unique IDs).

### Changed

1. Improved OpenAI chat streaming API.
1. Changed `asFunction` variants from namespaced functions into stand-alone functions.

## v0.0.15 - 2023-06-12

### Changed

1. Documentation update.

## v0.0.14 - 2023-06-11

### Changed

1. Major rework of embedding APIs.

## v0.0.13 - 2023-06-10

### Changed

1. Major rework of text and image generation APIs.

## v0.0.12 - 2023-06-06

## v0.0.11 - 2023-06-05

### Changed

1. Various renames.

## v0.0.10 - 2023-06-04

### New

1. Pinecone VectorDB support
1. Cohere tokenization support

## v0.0.9 - 2023-06-03

### New

1. OpenAI DALL-E image generation support
1. `generateImage` function
1. Throttling and retries on model level

## v0.0.8 - 2023-06-02

### New

1. Stability AI image generation support
1. Image generation Next.js example

### Changed

1. Updated PDF to tweet example with style transfer

## v0.0.7 - 2023-06-01

### New

1. Hugging Face text generation support
1. Memory vector DB

## v0.0.6 - 2023-05-31

### New

1. Cohere embedding API support

### Changes

1. Restructured retry logic
1. `embed` embeds many texts at once

## v0.0.5 - 2023-05-30

### New

1. Cohere text generation support
1. OpenAI chat streams can be returned as delta async iterables
1. Documentation of integration APIs and models

## v0.0.4 - 2023-05-29

### New

1. OpenAI embedding support
1. Text embedding functions
1. Chat streams can be returned as ReadableStream or AsyncIterable
1. Basic examples under `examples/basic`
1. Initial documentation available at [modelfusion.dev](https://modelfusion.dev)

## v0.0.3 - 2023-05-28

### New

1. Voice recording and transcription Next.js app example.
1. OpenAI transcription support (Whisper).

## v0.0.2 - 2023-05-27

### New

1. BabyAGI Example in TypeScript
1. TikToken for OpenAI: We've added tiktoken to aid in tokenization and token counting, including those for message and prompt overhead tokens in chat.
1. Tokenization-based Recursive Splitter: A new splitter that operates recursively using tokenization.
1. Prompt Management Utility: An enhancement to fit recent chat messages into the context window.

## v0.0.1 - 2023-05-26

### New

1. AI Chat Example using Next.js: An example demonstrating AI chat implementation using Next.js.
1. PDF to Twitter Thread Example: This shows how a PDF can be converted into a Twitter thread.
1. OpenAI Chat Completion Streaming Support: A feature providing real-time response capabilities using OpenAI's chat completion streaming.
1. OpenAI Chat and Text Completion Support: This addition enables the software to handle both chat and text completions from OpenAI.
1. Retry Management: A feature to enhance resilience by managing retry attempts for tasks.
1. Task Progress Reporting and Abort Signals: This allows users to track the progress of tasks and gives the ability to abort tasks when needed.
1. Recursive Character Splitter: A feature to split text into characters recursively for more detailed text analysis.
1. Recursive Text Mapping: This enables recursive mapping of text, beneficial for tasks like summarization or extraction.
1. Split-Map-Filter-Reduce for Text Processing: A process chain developed for sophisticated text handling, allowing operations to split, map, filter, and reduce text data.

```

```
