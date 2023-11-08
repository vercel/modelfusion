import dotenv from "dotenv";
import {
  DefaultRun,
  OpenAICostCalculator,
  OpenAISpeechModel,
  calculateCost,
  generateSpeech,
} from "modelfusion";

dotenv.config();

async function main() {
  const run = new DefaultRun();

  const speech1 = await generateSpeech(
    new OpenAISpeechModel({ model: "tts-1", voice: "alloy" }),
    "Hello world, this is a test!",
    { run }
  );

  const speech2 = await generateSpeech(
    new OpenAISpeechModel({ model: "tts-1", voice: "alloy" }),
    "Goodbye world, this is another test!",
    { run }
  );

  const cost = await calculateCost({
    calls: run.successfulModelCalls,
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 6 })}`);
}

main().catch(console.error);
