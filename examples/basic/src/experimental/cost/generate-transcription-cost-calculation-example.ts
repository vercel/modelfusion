import dotenv from "dotenv";
import { DefaultRun, generateTranscription, openai } from "modelfusion";
import {
  OpenAICostCalculator,
  calculateCost,
  extractSuccessfulModelCalls,
} from "@modelfusion/cost-calculator";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

async function main() {
  const audioData = await fs.promises.readFile(
    path.join(__dirname, "../../../data/test.mp3")
  );

  const run = new DefaultRun();

  const transcription = await generateTranscription({
    model: openai.Transcriber({ model: "whisper-1" }),
    mimeType: "audio/mp3",
    audioData,
    run,
  });

  console.log(transcription);

  const cost = await calculateCost({
    calls: extractSuccessfulModelCalls(run.events),
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log(
    `Transcription Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`
  );
}

main().catch(console.error);
