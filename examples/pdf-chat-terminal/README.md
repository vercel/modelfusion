# Chat with PDF (Terminal)

> _terminal app_, _PDF parsing_, _in memory vector indices_, _retrieval augmented generation_, _hypothetical document embedding_

Ask questions about a PDF document and get answers from the document.

## Usage

1. Create .env file with the following content:

```sh
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

2. Run the following commands from the root directory of the modelfusion repo:

```sh
pnpm install
pnpm build
pnpm tsx examples/pdf-chat-terminal/src/main.ts -f my.pdf
```
