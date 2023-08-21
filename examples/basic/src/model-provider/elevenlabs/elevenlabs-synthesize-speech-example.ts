import dotenv from "dotenv";
import { ElevenLabsSpeechSynthesisModel, synthesizeSpeech } from "modelfusion";
import fs from "node:fs";

dotenv.config();

(async () => {
  const speech = await synthesizeSpeech(
    new ElevenLabsSpeechSynthesisModel({
      voice: "ErXwobaYiN019PkySvjV",
    }),
    "Hello, World!"
  );

  const path = `./elevenlabs-speech-example.mp3`;
  fs.writeFileSync(path, speech);
})();
