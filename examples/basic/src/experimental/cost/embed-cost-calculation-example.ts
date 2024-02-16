import dotenv from "dotenv";
import { DefaultRun, embed, embedMany, openai } from "modelfusion";
import {
  OpenAICostCalculator,
  calculateCost,
  extractSuccessfulModelCalls,
} from "@modelfusion/cost-calculator";
dotenv.config();

async function main() {
  const run = new DefaultRun();

  const embeddings = await embedMany({
    model: openai.TextEmbedder({ model: "text-embedding-ada-002" }),
    values: [
      "At first, Nox didn't know what to do with the pup.",
      "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
    ],
    run,
  });

  const embeddings2 = await embed({
    model: openai.TextEmbedder({ model: "text-embedding-ada-002" }),
    value: "At first, Nox didn't know what to do with the pup.",
    run,
  });

  const cost = await calculateCost({
    calls: extractSuccessfulModelCalls(run.events),
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log(`Embeddings Cost: ${cost.formatAsDollarAmount({ decimals: 6 })}`);
}

main().catch(console.error);
