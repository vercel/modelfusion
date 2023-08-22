---
sidebar_position: 31
---

# Synthesize Speech

## Usage

### synthesizeSpeech

[synthesizeSpeech API](/api/modules#synthesizespeech)

Synthesize text into speech (audio data).

#### With ElevenLabs model

```ts
const speech = await synthesizeSpeech(
  new ElevenLabsSpeechSynthesisModel({
    voice: "ErXwobaYiN019PkySvjV",
  }),
  "Hello, World!"
);

fs.writeFileSync("example.mp3", speech);
```

## Available Providers

- [ElevenLabs](/integration/model-provider/elevenlabs)
