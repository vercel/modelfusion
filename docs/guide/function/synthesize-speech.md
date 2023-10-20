---
sidebar_position: 31
---

# Synthesize Speech

## Usage

[synthesizeSpeech API](/api/modules#synthesizespeech)

Synthesize text into speech (audio data).

### Standard mode

In standard mode, a text string is passed to the `synthesizeSpeech` function, along with a `SpeechSynthesisModel` instance, and an audio buffer with mpeg audio data is returned.

```ts
const speech = await synthesizeSpeech(
  new LmntSpeechSynthesisModel({
    voice: "034b632b-df71-46c8-b440-86a42ffc3cf3", // Henry
  }),
  "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
    "as The Rolling Stones unveil 'Hackney Diamonds,' their first collection of " +
    "fresh tunes in nearly twenty years, featuring the illustrious Lady Gaga, the " +
    "magical Stevie Wonder, and the final beats from the late Charlie Watts."
);
```

### Duplex streaming mode

In duplex streaming mode, an `AsyncIterable<string>` is passed to the `synthesizeSpeech` function, along with a `SpeechSynthesisModel` instance that supports duplex streaming, and an `AsyncIterable<Buffer>` is returned.

```ts
const textStream = await streamText(/* ... */);

const speechStream = await synthesizeSpeech(
  new ElevenLabsSpeechSynthesisModel({
    voice: "pNInz6obpgDQGcFmaJgB", // Adam
    model: "eleven_monolingual_v1",
    voiceSettings: { stability: 1, similarityBoost: 0.35 },
    generationConfig: {
      chunkLengthSchedule: [50, 90, 120, 150, 200],
    },
  }),
  textStream,
  { mode: "stream-duplex" }
);

for await (const part of speechStream) {
  // each part is a Buffer with MP3 audio data
}
```

## Available Providers

- [ElevenLabs](/integration/model-provider/elevenlabs) - Standard mode and duplex streaming mode
- [LMNT](/integration/model-provider/lmnt) - Standard mode only
