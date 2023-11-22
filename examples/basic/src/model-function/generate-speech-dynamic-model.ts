import dotenv from "dotenv";
import {
  SpeechGenerationModel,
  elevenlabs,
  generateSpeech,
  lmnt,
} from "modelfusion";

dotenv.config();

async function callModel(model: SpeechGenerationModel) {
  return await generateSpeech(model, "Hello, World!");
}
async function main() {
  const model =
    Math.random() < 0.5
      ? lmnt.Speech({
          voice: "034b632b-df71-46c8-b440-86a42ffc3cf3", // Henry
        })
      : elevenlabs.Speech({
          voice: "pNInz6obpgDQGcFmaJgB", // Adam
        });

  const speech = await callModel(model);
}

main().catch(console.error);
