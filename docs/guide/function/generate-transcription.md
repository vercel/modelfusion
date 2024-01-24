---
sidebar_position: 30
---

# Generate Transcription

Transcribe speech (audio) data into text. Also called speech-to-text (STT).

## Usage

### generateTranscription

[generateTranscription API](/api/modules#generatetranscription)

`generateTranscription` uses a model, audio data, and a mime type to generate a transcription.

#### With OpenAI transcription model

```ts
import { generateTranscription, openai } from "modelfusion";
import fs from "node:fs";

const transcription = await generateTranscription({
  model: openai.Transcriber({ model: "whisper-1" }),
  mimeType: "audio/mp3",
  audioData: await fs.promises.readFile("data/test.mp3"),
});
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Whisper.cpp](/integration/model-provider/whispercpp)
