import dotenv from "dotenv";
import {
  ElevenLabsSpeechModel,
  LmntSpeechModel,
  SpeechGenerationModel,
  generateSpeech,
} from "modelfusion";

dotenv.config();

async function callModel(model: SpeechGenerationModel) {
  return await generateSpeech(model, "Hello, World!");
}
async function main() {
  const model =
    Math.random() < 0.5
      ? new LmntSpeechModel({
          voice: "034b632b-df71-46c8-b440-86a42ffc3cf3", // Henry
        })
      : new ElevenLabsSpeechModel({
          voice: "pNInz6obpgDQGcFmaJgB", // Adam
        });

  const speech = await callModel(model);
}

main().catch(console.error);
