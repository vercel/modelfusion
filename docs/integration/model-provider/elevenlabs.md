---
sidebar_position: 20
---

# ElevenLabs

## Setup

1. You can get an API key from [ElevenLabs](https://elevenlabs.io/).
1. The API key can be configured as an environment variable (`ELEVENLABS_API_KEY`) or passed in as an option into the model constructor.

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/elevenlabs)

### Synthesize Speech

[ElevenLabsSpeechSynthesisModel API](/api/classes/ElevenLabsSpeechSynthesisModel)

```ts
import { ElevenLabsSpeechSynthesisModel, synthesizeSpeech } from "modelfusion";

const speech = await synthesizeSpeech(
  new ElevenLabsSpeechSynthesisModel({
    voice: "ErXwobaYiN019PkySvjV",
  }),
  "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
    "as The Rolling Stones unveil 'Hackney Diamonds,' their first collection of " +
    "fresh tunes in nearly twenty years, featuring the illustrious Lady Gaga, the " +
    "magical Stevie Wonder, and the final beats from the late Charlie Watts."
);

const path = `./elevenlabs-speech-example.mp3`;
fs.writeFileSync(path, speech);
```
