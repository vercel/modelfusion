import dotenv from "dotenv";
import { generateTranscription, openai } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

async function main() {
  const transcription = await generateTranscription({
    model: openai.Transcriber({ model: "whisper-1" }),
    mimeType: "audio/mp3",
    audioData: await fs.promises.readFile(
      path.join(__dirname, "../../data/test.mp3")
    ),
  });

  console.log(transcription);
}

main().catch(console.error);
