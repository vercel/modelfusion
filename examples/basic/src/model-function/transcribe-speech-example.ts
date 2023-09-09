import { OpenAITranscriptionModel, transcribe } from "modelfusion";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

async function main() {
  const data = await fs.promises.readFile("data/test.mp3");

  const transcription = await transcribe(
    new OpenAITranscriptionModel({ model: "whisper-1" }),
    {
      type: "mp3",
      data,
    }
  );

  console.log(transcription);
}

main().catch(console.error);
