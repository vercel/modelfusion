import dotenv from "dotenv";
import { ElevenLabsSpeechModel, generateSpeech } from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const speech = await generateSpeech(
    new ElevenLabsSpeechModel({
      voice: "pNInz6obpgDQGcFmaJgB", // Adam
    }),
    "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
      "as The Rolling Stones unveil 'Hackney Diamonds,' their first collection of " +
      "fresh tunes in nearly twenty years, featuring the illustrious Lady Gaga, the " +
      "magical Stevie Wonder, and the final beats from the late Charlie Watts."
  );

  const path = `./elevenlabs-speech-example.mp3`;
  fs.writeFileSync(path, speech);
}

main().catch(console.error);
