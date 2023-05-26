# ai-utils

## Quick Install

```bash
npm install --save @lgrammel/ai-utils
```

## Examples

### [PDF to Twitter Thread](https://github.com/lgrammel/ai-utils/tree/main/examples/pdf-to-twitter-thread-console)

> _terminal app_, _PDF parsing_, _split-map-filter-reduce_, _OpenAI GPT-4_

Takes a PDF and a topic and creates a Twitter thread with all content from the PDF that is relevant to the topic.

### [AI Chat (Next.JS)](https://github.com/lgrammel/ai-utils/tree/main/examples/ai-chat-next-js)

> _Next.js app_, _OpenAI GPT-3.5-turbo_, _streaming_, _stream forwarding (secure API key on server)_

A basic web chat with an AI assistant.

## Features

- Text processing chains
  - recursive text mapping (e.g. for summarization or extraction)
  - split-map-filter-reduce for text processing
- Text splitters
  - Recursive character splitter
- Run abstraction for progress reporting and abort signals
- Retry management
- Error handling

## Integrations

- OpenAI
  - chat completions (regular, streaming)
  - text completions (regular)
