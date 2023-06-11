# Changelog

## 0.0.14 - 2023-06-11

### Changed

1. Major rework of embedding APIs.

## 0.0.13 - 2023-06-10

### Changed

1. Major rework of text and image generation APIs.

## 0.0.12 - 2023-06-06

## 0.0.11 - 2023-06-05

### Changed

1. Various renames.

## 0.0.10 - 2023-06-04

### New

1. Pinecone VectorDB support
1. Cohere tokenization support

## 0.0.9 - 2023-06-03

### New

1. OpenAI DALL-E image generation support
1. `generateImage` function
1. Throttling and retries on model level

## 0.0.8 - 2023-06-02

### New

1. Stability AI image generation support
1. Image generation Next.js example

### Changed

1. Updated PDF to tweet example with style transfer

## 0.0.7 - 2023-06-01

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
1. Initial documentation available at [ai-utils.dev](https://ai-utils.dev)

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
