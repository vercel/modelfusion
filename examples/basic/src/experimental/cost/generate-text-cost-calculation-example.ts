import dotenv from "dotenv";
import { DefaultRun, generateText, openai } from "modelfusion";
import {
  OpenAICostCalculator,
  calculateCost,
} from "@modelfusion/cost-calculator";

dotenv.config();

async function main() {
  const run = new DefaultRun();

  const text = await generateText({
    model: openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0.7,
      maxGenerationTokens: 500,
    }),
    prompt: "Write a short story about a robot learning to love:\n\n",
    run,
  });

  console.log(text);

  const cost = await calculateCost({
    calls: run.getSuccessfulModelCalls(),
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log();
  console.log(`Text Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
}

main().catch(console.error);
