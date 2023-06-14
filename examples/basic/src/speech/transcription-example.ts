import fs from "node:fs";
import { OpenAITranscriptionModel } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const data = await fs.promises.readFile("data/test.mp3");

  const model = new OpenAITranscriptionModel({ model: "whisper-1" });

  const transcription = await model.transcribe({
    type: "mp3",
    data,
  });

  console.log(transcription);
})();
