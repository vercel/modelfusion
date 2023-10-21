import dotenv from "dotenv";
import {
  ElevenLabsSpeechSynthesisModel,
  OpenAITextGenerationModel,
  generateText,
  synthesizeSpeech,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const text = await generateText(
    new OpenAITextGenerationModel({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0.7,
      maxCompletionTokens: 100,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  const speechStream = await synthesizeSpeech(
    new ElevenLabsSpeechSynthesisModel({
      voice: "pNInz6obpgDQGcFmaJgB", // Adam
      voiceSettings: {
        stability: 1,
        similarityBoost: 0.35,
      },
    }),
    text,
    { mode: "stream-duplex" }
  );

  // delete output file if it already exists:
  if (fs.existsSync("./stream-text-example.mp3")) {
    fs.rmSync("./stream-text-example.mp3");
  }

  let counter = 0;
  for await (const speechFragment of speechStream) {
    counter++;
    console.log(`Writing fragment ${counter}...`);
    fs.appendFileSync("./stream-text-example.mp3", speechFragment);
  }
}

main().catch(console.error);
