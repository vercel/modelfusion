import dotenv from "dotenv";
import { generateTranscription, whispercpp } from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const audioData = await fs.promises.readFile("data/test.wav");

  const transcription = await generateTranscription({
    model: whispercpp.Transcriber({
      // Custom API configuration:
      api: whispercpp.Api({
        baseUrl: { host: "localhost", port: "8080" },
      }),
    }),
    mimeType: "audio/wav",
    audioData,
  });

  console.log(transcription);
}

main().catch(console.error);
