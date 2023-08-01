import {
  DefaultRun,
  OpenAICostCalculator,
  OpenAITranscriptionModel,
  transcribe,
} from "modelfusion";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

(async () => {
  const data = await fs.promises.readFile("data/test.mp3");

  const run = new DefaultRun({
    costCalculators: [new OpenAICostCalculator()],
  });

  const { transcription } = await transcribe(
    new OpenAITranscriptionModel({ model: "whisper-1" }),
    { type: "mp3", data },
    { run }
  );

  console.log(transcription);

  const cost = await run.calculateCost();

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
})();
