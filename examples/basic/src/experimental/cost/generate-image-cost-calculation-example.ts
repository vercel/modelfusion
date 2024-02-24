import dotenv from "dotenv";
import { DefaultRun, generateImage, openai } from "modelfusion";
import {
  OpenAICostCalculator,
  calculateCost,
} from "@modelfusion/cost-calculator";

dotenv.config();

async function main() {
  const run = new DefaultRun();

  const image = await generateImage({
    model: openai.ImageGenerator({
      model: "dall-e-3",
      size: "1024x1024",
      quality: "hd",
    }),
    prompt:
      "the wicked witch of the west in the style of early 19th century painting",
    run,
  });

  const cost = await calculateCost({
    calls: run.getSuccessfulModelCalls(),
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log(`Image Cost: ${cost.formatAsDollarAmount({ decimals: 3 })}`);
}

main().catch(console.error);
