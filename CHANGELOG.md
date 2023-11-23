# Changelog

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

- Model provider facades. You can e.g. now use `ollama.TextGenerator(...)` instead of `new OllamaTextGenerationModel(...)`.

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
- `FunctionListToolCallPromptFormat` to simplify tool calls with text models
- `.asToolCallGenerationModel()` to `OllamaTextGenerationModel` to simplify tool calls:

  ```ts
  const { tool, args, toolCall, result } = await useTool(
    new OllamaTextGenerationModel({
      model: "mistral",
      temperature: 0,
    }).asToolCallGenerationModel(FunctionListToolCallPromptFormat.text()),
    calculator,
    "What's fourteen times twelve?"
  );
  ```

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

- `Tool` now has `parameters` and `returnType` schemas (instead of `inputSchema` and `outputSchema`).
- `useTool` uses `generateToolCall` under the hood. The return value and error handling has changed.
- `useToolOrGenerateText` has been renamed to `useToolsOrGenerateText`. It now uses `generateToolCallsOrText` under the hood. The return value and error handling has changed. It can now invoke several tools in parallel and returns an array of tool results.
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
- **breaking change**: Prompt formats are now namespaced. Use e.g. `Llama2PromptFormat.chat()` instead of `mapChatPromptToLlama2Format()`. See [Prompt Format](https://modelfusion.dev/guide/function/generate-text#prompt-format) for documentation of the new prompt formats.

## v0.69.0 - 2023-11-15

### Added

- Experimental generateToolCall function for generating a single tool call using the OpenAI chat/tools API.

## v0.68.0 - 2023-11-14

### Changed

- Refactored JSON parsing to use abstracted schemas. You can now use `parseJSON` and `safeParseJSON` to securely parse JSON objects and optionally type-check them using any schema (e.g. a Zod schema).

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

- **breaking change**: `OpenAIImageGenerationModel` now requires a `model` parameter.

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

- **breaking change**: Uncaught errors were caused by custom Promises. ModelFusion now uses only standard Promises. To get full responses from model function, you now need to use the `{ returnType: "full" }` option instead of calling `.asFullResponse()` on the result.

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

- **breaking change**: `readEventSource` and `readEventSourceStream` are now part of 'modelfusion/browser'.

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

- You can now directly pass JSON schemas into `generateStructure` and `generateStructureOrText` calls without validation using `UncheckedJsonSchemaStructureDefinition`. This is useful when you need more flexility and don't require type inference. See `examples/basic/src/util/schema/generate-structure-unchecked-json-schema-example.ts`.

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

- Introduced unified `stopSequences` and `maxCompletionTokens` properties for all text generation models. **Breaking change**: `maxCompletionTokens` and `stopSequences` are part of the base TextGenerationModel. Specific names for these properties in models have been replaced by this, e.g. `maxTokens` in OpenAI models is now `maxCompletionTokens`.

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

- Bugs related to performance.now not being available.

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

## vv0.0.6 - 2023-05-31

### New

1. Cohere embedding API support

### Changes

1. Restructured retry logic
1. `embed` embeds many texts at once

## vv0.0.5 - 2023-05-30

### New

1. Cohere text generation support
1. OpenAI chat streams can be returned as delta async iterables
1. Documentation of integration APIs and models

## vv0.0.4 - 2023-05-29

### New

1. OpenAI embedding support
1. Text embedding functions
1. Chat streams can be returned as ReadableStream or AsyncIterable
1. Basic examples under `examples/basic`
1. Initial documentation available at [modelfusion.dev](https://modelfusion.dev)

## vv0.0.3 - 2023-05-28

### New

1. Voice recording and transcription Next.js app example.
1. OpenAI transcription support (Whisper).

## vv0.0.2 - 2023-05-27

### New

1. BabyAGI Example in TypeScript
1. TikToken for OpenAI: We've added tiktoken to aid in tokenization and token counting, including those for message and prompt overhead tokens in chat.
1. Tokenization-based Recursive Splitter: A new splitter that operates recursively using tokenization.
1. Prompt Management Utility: An enhancement to fit recent chat messages into the context window.

## vv0.0.1 - 2023-05-26

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
