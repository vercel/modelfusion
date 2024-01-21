import dotenv from "dotenv";
import { DefaultRun, generateTranscription, openai } from "modelfusion";
import {
  OpenAICostCalculator,
  calculateCost,
  extractSuccessfulModelCalls,
} from "modelfusion-experimental";
import fs from "node:fs";

dotenv.config();

async function main() {
  const audioData = await fs.promises.readFile("data/test.mp3");

  const run = new DefaultRun();

  const transcription = await generateTranscription({
    model: openai.Transcriber({ model: "whisper-1" }),
    mimeType: "audio/mp3",
    audioData,
  });

  console.log(transcription);

  const cost = await calculateCost({
    calls: extractSuccessfulModelCalls(run.events),
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
}

main().catch(console.error);
