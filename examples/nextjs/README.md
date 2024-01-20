# Next.js ModelFusion Demo

> _Next.js app_, _image generation_, _transcription_, _OpenAI_, _Stability AI_

Examples of using ModelFusion with Next.js 14 (App Router):

- image generation
- voice recording & transcription

## Usage

1. Create .env.local file with the following content:

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

Go to http://localhost:3000/generate-image in your browser.

### Generate Transcription

> _Record audio with push-to-talk and transcribe it using Whisper, implemented as a Next.js app. The app shows a list of the transcriptions._

Go to http://localhost:3000/generate-transcription in your browser.
