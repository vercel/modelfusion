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
  new LmntSpeechSynthesisModel({
    voice: "034b632b-df71-46c8-b440-86a42ffc3cf3", // Henry
  }),
  "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
    "as The Rolling Stones unveil 'Hackney Diamonds,' their first collection of " +
    "fresh tunes in nearly twenty years, featuring the illustrious Lady Gaga, the " +
    "magical Stevie Wonder, and the final beats from the late Charlie Watts."
);
```

## Available Providers

- [ElevenLabs](/integration/model-provider/elevenlabs)
- [LMNT](/integration/model-provider/lmnt)
