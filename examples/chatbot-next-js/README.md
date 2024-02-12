# Chatbot (Next.js)

> _Next.js app_, _OpenAI GPT-3.5-turbo_, _streaming_, _stream forwarding (keep API key on server)_

A web chat with an AI assistant.

## Usage

1. Create `.env.local` file with the following content:

```sh
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

2. Run the following commands from the root directory of the modelfusion repo:

```sh
pnpm install
pnpm build
cd examples/chatbot-next-js
pnpm dev
```

3. Go to http://localhost:3000/ in your browser
