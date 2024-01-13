import dotenv from "dotenv";
import { generateTranscription, whispercpp } from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const data = await fs.promises.readFile("data/test.wav");

  const transcription = await generateTranscription({
    model: whispercpp.Transcriber(),
    data: { type: "wav", data },
  });

  console.log(transcription);
}

main().catch(console.error);
