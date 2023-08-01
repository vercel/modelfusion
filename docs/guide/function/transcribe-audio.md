---
sidebar_position: 30
---

# Transcribe Audio

## Usage

### transcribe

[transcribe API](/api/modules#transcribe)

Transcribe audio data into text.

#### With OpenAI transcription model

```ts
const data = await fs.promises.readFile("data/test.mp3");

const { transcription } = await transcribe(
  new OpenAITranscriptionModel({ model: "whisper-1" }),
  {
    type: "mp3",
    data,
  }
);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
