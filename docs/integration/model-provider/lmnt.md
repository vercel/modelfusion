---
sidebar_position: 21
---

# LMNT

## Setup

1. You can get an API key from [LMNT](https://lmnt.com/).
1. The API key can be configured as an environment variable (`LMNT_API_KEY`) or passed in as an option into the model constructor.

## Configuration

### API Configuration

[LMNT API Configuration](/api/classes/LmntApiConfiguration)

```ts
const api = new LmntApiConfiguration({
  // ...
});

const model = new LmntSpeechSynthesisModel({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/lmnt)

### Synthesize Speech

[LmntSpeechSynthesisModel API](/api/classes/LmntSpeechSynthesisModel)

```ts
import { LmntSpeechSynthesisModel, synthesizeSpeech } from "modelfusion";

const speech = await synthesizeSpeech(
  new LmntSpeechSynthesisModel({
    voice: "034b632b-df71-46c8-b440-86a42ffc3cf3", // Henry
  }),
  "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
    "as The Rolling Stones unveil 'Hackney Diamonds,' their first collection of " +
    "fresh tunes in nearly twenty years, featuring the illustrious Lady Gaga, the " +
    "magical Stevie Wonder, and the final beats from the late Charlie Watts."
);

const path = `./lmnt-speech-example.mp3`;
fs.writeFileSync(path, speech);
```
