---
sidebar_position: 100
title: Whisper.cpp
---

# Whisper.cpp

Transcribe text using [whisper.cpp](https://github.com/ggerganov/whisper.cpp). You can run the whisper.cpp server locally or remote.

## Setup

1. Install [whisper.cpp](https://github.com/ggerganov/whisper.cpp) following the instructions in the `whisper.cpp` repository.
1. Start the [whisper.cpp server](https://github.com/ggerganov/whisper.cpp/tree/master/examples/server): `./server`
1. (optional): [Download larger models](https://huggingface.co/ggerganov/whisper.cpp/tree/main) and start the server with the `--model` parameter
1. (optional): Enable input conversion on the server using the `--convert` parameter

:::note
Without the `--convert` parameter, the server expects WAV files with 16kHz sample rate and 16-bit PCM encoding. You can use `ffmpeg` for conversion:
`ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav`
:::

## Configuration

### API Configuration

[Whisper.cpp API Configuration](/api/classes/WhisperCppApiConfiguration)

```ts
const api = whispercpp.Api({
  baseUrl: "http://localhost:8080",
  // ...
});

const model = whispercpp.Transcriber({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/whispercpp)

### Generate Transcription

[WhisperCppTranscriptionModel API](/api/classes/WhisperCppTranscriptionModel)

```ts
import fs from "node:fs";
import { whispercpp, generateTranscription } from "modelfusion";

const data = await fs.promises.readFile("data/test.wav");

const transcription = await generateTranscription(
  // Whisper.cpp model:
  whispercpp.Transcriber(),
  { type: "wav", data }
);
```
