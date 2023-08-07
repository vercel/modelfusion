# Changelog

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
