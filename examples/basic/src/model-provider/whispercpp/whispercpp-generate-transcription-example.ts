import dotenv from "dotenv";
import { generateTranscription, whispercpp } from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const transcription = await generateTranscription({
    model: whispercpp.Transcriber(),
    mimeType: "audio/wav",
    audioData: await fs.promises.readFile("data/test.wav"),
  });

  console.log(transcription);
}

main().catch(console.error);
