import dotenv from "dotenv";
import { DefaultRun, generateText, openai } from "modelfusion";
import {
  OpenAICostCalculator,
  calculateCost,
  extractSuccessfulModelCalls,
} from "modelfusion-experimental";

dotenv.config();

async function main() {
  const run = new DefaultRun();

  const text = await generateText(
    openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0.7,
      maxGenerationTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { run }
  );

  console.log(text);

  const cost = await calculateCost({
    calls: extractSuccessfulModelCalls(run.events),
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log();
  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
}

main().catch(console.error);
