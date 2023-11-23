---
sidebar_position: 30
---

# Generate Transcription

Transcribe speech (audio) data into text. Also called speech-to-text (STT).

## Usage

### generateTranscription

[generateTranscription API](/api/modules#generatetranscription)

#### With OpenAI transcription model

```ts
import { generateTranscription, openai } from "modelfusion";

const data = await fs.promises.readFile("data/test.mp3");

const transcription = await generateTranscription(
  openai.Transcription({ model: "whisper-1" }),
  {
    type: "mp3",
    data,
  }
);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
