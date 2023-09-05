import dotenv from "dotenv";
import {
  DefaultRun,
  OpenAICostCalculator,
  OpenAIImageGenerationModel,
  calculateCost,
  generateImage,
} from "modelfusion";

dotenv.config();

(async () => {
  const run = new DefaultRun();

  const image = await generateImage(
    new OpenAIImageGenerationModel({ size: "512x512" }),
    "the wicked witch of the west in the style of early 19th century painting",
    { run }
  );

  const cost = await calculateCost({
    calls: run.successfulModelCalls,
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 3 })}`);
})();
