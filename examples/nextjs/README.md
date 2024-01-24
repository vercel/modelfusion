# Next.js ModelFusion Demo

> _Next.js app_, _image generation_, _transcription_, _object streaming_, _OpenAI_, _Stability AI_, _Ollama_

Examples of using ModelFusion with Next.js 14 (App Router):

- image generation
- voice recording & transcription
- object streaming

## Usage

1. Create a `.env.local` file with the following content (depending on which demo you want to run)):

```
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
STABILITY_API_KEY="YOUR_STABILITY_API_KEY"
```

2. Run the following commands:

```sh
pnpm install
pnpm dev
```

## Demos

### Generate Image

> _Create an 19th century painting image for your input._

You need to set up the `STABILITY_API_KEY` environment variable to run this demo.

Go to http://localhost:3000/generate-image in your browser.

### Generate Transcription

> _Record audio with push-to-talk and transcribe it using Whisper, implemented as a Next.js app. The app shows a list of the transcriptions._

You need to set up the `OPENAI_API_KEY` environment variable to run this demo.

Go to http://localhost:3000/generate-transcription in your browser.

### Stream Objects through Server (OpenAI)

> _Generate travel itineraries using OpenAI_

You need to set up the `OPENAI_API_KEY` environment variable to run this demo.

Go to http://localhost:3000/stream-object-openai in your browser.

### Stream Objects on Client (Ollama)

> _Generate travel itineraries using Ollama_

You need to install [Ollama](https://ollama.ai/) and download the `openhermes` model to run this demo.

Go to http://localhost:3000/stream-object-ollama in your browser.
