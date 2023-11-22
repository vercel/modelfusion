import dotenv from "dotenv";
import {
  DefaultRun,
  OpenAICostCalculator,
  calculateCost,
  generateTranscription,
  openai,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const data = await fs.promises.readFile("data/test.mp3");

  const run = new DefaultRun();

  const transcription = await generateTranscription(
    openai.Transcription({ model: "whisper-1" }),
    { type: "mp3", data },
    { run }
  );

  console.log(transcription);

  const cost = await calculateCost({
    calls: run.successfulModelCalls,
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
}

main().catch(console.error);
