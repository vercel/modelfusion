---
sidebar_position: 20
---

# ElevenLabs

## Setup

1. You can get an API key from [ElevenLabs](https://elevenlabs.io/).
1. The API key can be configured as an environment variable (`ELEVENLABS_API_KEY`) or passed in as an option into the model constructor.

## Configuration

### API Configuration

[ElevenLabs API Configuration](/api/classes/ElevenLabsApiConfiguration)

```ts
const api = new ElevenLabsApiConfiguration({
  // ...
});

const model = new ElevenLabsSpeechModel({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/elevenlabs)
| [ElevenLabsSpeechModel API](/api/classes/ElevenLabsSpeechModel)

### Generate Speech

```ts
import { ElevenLabsSpeechModel, generateSpeech } from "modelfusion";

const speech = await generateSpeech(
  new ElevenLabsSpeechModel({
    voice: "pNInz6obpgDQGcFmaJgB", // Adam
  }),
  "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
    "as The Rolling Stones unveil 'Hackney Diamonds,' their first collection of " +
    "fresh tunes in nearly twenty years, featuring the illustrious Lady Gaga, the " +
    "magical Stevie Wonder, and the final beats from the late Charlie Watts."
);

const path = `./elevenlabs-speech-example.mp3`;
fs.writeFileSync(path, speech);
```

### Stream Speech

```ts
const textStream = await streamText(/* ... */);

const speechStream = await streamSpeech(
  new ElevenLabsSpeechModel({
    voice: "pNInz6obpgDQGcFmaJgB", // Adam
    model: "eleven_monolingual_v1",
    voiceSettings: { stability: 1, similarityBoost: 0.35 },
    generationConfig: {
      chunkLengthSchedule: [50, 90, 120, 150, 200],
    },
  }),
  textStream
);

for await (const part of speechStream) {
  // each part is a Buffer with MP3 audio data
}
```
