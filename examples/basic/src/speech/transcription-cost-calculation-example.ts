import fs from "node:fs";
import {
  DefaultRun,
  OpenAICostCalculator,
  OpenAITranscriptionModel,
} from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const data = await fs.promises.readFile("data/test.mp3");

  const model = new OpenAITranscriptionModel({ model: "whisper-1" });

  const run = new DefaultRun({
    costCalculators: [new OpenAICostCalculator()],
  });

  const transcription = await model.transcribe({ type: "mp3", data }, { run });

  console.log(transcription);

  const cost = await run.calculateCost();

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
})();
