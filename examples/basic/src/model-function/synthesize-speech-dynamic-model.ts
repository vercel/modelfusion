import dotenv from "dotenv";
import {
  ElevenLabsSpeechSynthesisModel,
  LmntSpeechSynthesisModel,
  SpeechSynthesisModel,
  synthesizeSpeech,
} from "modelfusion";

dotenv.config();

async function callModel(model: SpeechSynthesisModel) {
  return await synthesizeSpeech(model, "Hello, World!");
}
async function main() {
  const model =
    Math.random() < 0.5
      ? new LmntSpeechSynthesisModel({
          voice: "034b632b-df71-46c8-b440-86a42ffc3cf3", // Henry
        })
      : new ElevenLabsSpeechSynthesisModel({
          voice: "pNInz6obpgDQGcFmaJgB", // Adam
        });

  const speech = await callModel(model);
}

main().catch(console.error);
