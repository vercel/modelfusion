import dotenv from "dotenv";
import {
  ElevenLabsSpeechSynthesisModel,
  LmntSpeechSynthesisModel,
  synthesizeSpeech,
} from "modelfusion";

dotenv.config();

function getModel() {
  return Math.random() < 0.5
    ? new LmntSpeechSynthesisModel({
        voice: "034b632b-df71-46c8-b440-86a42ffc3cf3", // Henry
      })
    : new ElevenLabsSpeechSynthesisModel({
        voice: "pNInz6obpgDQGcFmaJgB", // Adam
      });
}

async function main() {
  const speech = await synthesizeSpeech(getModel(), "Hello, World!");
}

main().catch(console.error);
