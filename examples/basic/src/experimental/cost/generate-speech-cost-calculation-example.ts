import dotenv from "dotenv";
import { DefaultRun, generateSpeech, openai } from "modelfusion";
import {
  OpenAICostCalculator,
  calculateCost,
  extractSuccessfulModelCalls,
} from "@modelfusion/cost-calculator";

dotenv.config();

async function main() {
  const run = new DefaultRun();

  const speech1 = await generateSpeech({
    model: openai.SpeechGenerator({ model: "tts-1", voice: "alloy" }),
    text: "Hello world, this is a test!",
    run,
  });

  const speech2 = await generateSpeech({
    model: openai.SpeechGenerator({ model: "tts-1", voice: "alloy" }),
    text: "Goodbye world, this is another test!",
    run,
  });

  const cost = await calculateCost({
    calls: extractSuccessfulModelCalls(run.events),
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log(`Speech Cost: ${cost.formatAsDollarAmount({ decimals: 6 })}`);
}

main().catch(console.error);
