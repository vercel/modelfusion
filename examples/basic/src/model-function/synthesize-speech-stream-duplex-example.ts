import dotenv from "dotenv";
import {
  ElevenLabsSpeechSynthesisModel,
  OpenAITextGenerationModel,
  streamText,
  synthesizeSpeech,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const textStream = await streamText(
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
    }),
    textStream,
    { mode: "stream-duplex" }
  );

  let counter = 0;
  for await (const speechFragment of speechStream) {
    counter++;
    console.log(`Writing fragment ${counter}...`);
    fs.appendFileSync("./stream-text-example.mp3", speechFragment);
  }
}

main().catch(console.error);
