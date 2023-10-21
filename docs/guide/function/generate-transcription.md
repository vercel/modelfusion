---
sidebar_position: 30
---

# Generate Transcription

Transcribe speech (audio) data into text. Also called speech-to-text (STT).

## Usage

[generateTranscription API](/api/modules#generatetranscription)

#### With OpenAI transcription model

```ts
const data = await fs.promises.readFile("data/test.mp3");

const transcription = await generateTranscription(
  new OpenAITranscriptionModel({ model: "whisper-1" }),
  {
    type: "mp3",
    data,
  }
);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
