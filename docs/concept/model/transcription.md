---
sidebar_position: 30
---

# Transcription

## Usage

[TranscriptionModel API](/api/interfaces/TranscriptionModel)

### transcribe

Transcribe audio data into text.

#### With OpenAI transcription model

```ts
const data = await fs.promises.readFile("data/test.mp3");
const model = new OpenAITranscriptionModel(/* ... */);

const transcription = await model.transcribe({
  type: "mp3",
  data,
});
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
