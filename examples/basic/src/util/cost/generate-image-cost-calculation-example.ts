import dotenv from "dotenv";
import { DefaultRun, generateImage, openai } from "modelfusion";
import {
  OpenAICostCalculator,
  calculateCost,
  extractSuccessfulModelCalls,
} from "modelfusion-experimental";

dotenv.config();

async function main() {
  const run = new DefaultRun();

  const image = await generateImage(
    openai.ImageGenerator({
      model: "dall-e-3",
      size: "1024x1024",
      quality: "hd",
    }),
    "the wicked witch of the west in the style of early 19th century painting",
    { run }
  );

  const cost = await calculateCost({
    calls: extractSuccessfulModelCalls(run.events),
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 3 })}`);
}

main().catch(console.error);
