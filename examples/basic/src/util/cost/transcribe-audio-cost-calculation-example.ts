import dotenv from "dotenv";
import {
  DefaultRun,
  OpenAICostCalculator,
  OpenAITranscriptionModel,
  calculateCost,
  transcribe,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

(async () => {
  const data = await fs.promises.readFile("data/test.mp3");

  const run = new DefaultRun();

  const transcription = await transcribe(
    new OpenAITranscriptionModel({ model: "whisper-1" }),
    { type: "mp3", data },
    { run }
  );

  console.log(transcription);

  const cost = await calculateCost({
    calls: run.successfulModelCalls,
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
})();
