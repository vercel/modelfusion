import dotenv from "dotenv";
import {
  OpenAICompletionModel,
  elevenlabs,
  streamSpeech,
  streamText,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const textStream = await streamText(
    new OpenAICompletionModel({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0.7,
      maxCompletionTokens: 100,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  const speechStream = await streamSpeech(
    elevenlabs.Speech({
      voice: "pNInz6obpgDQGcFmaJgB", // Adam
      optimizeStreamingLatency: 1,
      voiceSettings: {
        stability: 1,
        similarityBoost: 0.35,
      },
    }),
    textStream
  );

  // delete output file if it already exists:
  if (fs.existsSync("./stream-text-example.mp3")) {
    fs.rmSync("./stream-text-example.mp3");
  }

  let counter = 0;
  for await (const speechPart of speechStream) {
    counter++;
    console.log(`Writing part ${counter}...`);
    fs.appendFileSync("./stream-text-example.mp3", speechPart);
  }
}

main().catch(console.error);
