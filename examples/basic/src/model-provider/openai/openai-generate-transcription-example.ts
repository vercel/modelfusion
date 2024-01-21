import dotenv from "dotenv";
import { generateTranscription, openai } from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const audioData = await fs.promises.readFile("data/test.mp3");

  const transcription = await generateTranscription({
    model: openai.Transcriber({ model: "whisper-1" }),
    mimeType: "audio/mp3",
    audioData,
  });

  console.log(transcription);
}

main().catch(console.error);
