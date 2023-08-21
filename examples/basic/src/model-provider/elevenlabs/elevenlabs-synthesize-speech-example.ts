import dotenv from "dotenv";
import { ElevenLabsSpeechSynthesisModel } from "modelfusion";
import fs from "node:fs";

dotenv.config();

(async () => {
  const model = new ElevenLabsSpeechSynthesisModel({
    voice: "21m00Tcm4TlvDq8ikWAM", // Rachel
  });

  const speechBuffer = await model.generateSpeechResponse("Hello world!");

  const path = `./elevenlabs-speech-example.mp3`;
  fs.writeFileSync(path, speechBuffer);
})();
