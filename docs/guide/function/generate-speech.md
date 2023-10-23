---
sidebar_position: 30
---

# Generate Speech

Synthesize speech (audio) from text. Also called TTS (text-to-speech).

## Usage

### generateSpeech

[generateSpeech API](/api/modules#generatespeech)

In standard mode, a text string is passed to the `generateSpeech` function, along with a `SpeechGenerationModel` instance, and an audio buffer with mpeg audio data is returned.

```ts
const speech = await generateSpeech(
  new LmntSpeechModel({
    voice: "034b632b-df71-46c8-b440-86a42ffc3cf3", // Henry
  }),
  "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
    "as The Rolling Stones unveil 'Hackney Diamonds,' their first collection of " +
    "fresh tunes in nearly twenty years, featuring the illustrious Lady Gaga, the " +
    "magical Stevie Wonder, and the final beats from the late Charlie Watts."
);
```

### streamSpeech

[streamSpeech API](/api/modules#streamspeech)

In duplex streaming mode, an `AsyncIterable<string>` is passed to the `streamSpeech` function, along with a `StreamingSpeechGenerationModel`, and an `AsyncIterable<Buffer>` is returned. You can also pass in a string and get streaming audio back.

```ts
const textStream = await streamText(/* ... */);

const speechStream = await streamSpeech(
  new ElevenLabsSpeechModel({
    voice: "pNInz6obpgDQGcFmaJgB", // Adam
    optimizeStreamingLatency: 1,
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

## Available Providers

- [ElevenLabs](/integration/model-provider/elevenlabs) - Standard mode and duplex streaming mode
- [LMNT](/integration/model-provider/lmnt) - Standard mode
