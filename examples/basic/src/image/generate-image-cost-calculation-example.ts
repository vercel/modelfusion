import {
  DefaultRun,
  OpenAICostCalculator,
  OpenAIImageGenerationModel,
} from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const run = new DefaultRun({
    costCalculators: [new OpenAICostCalculator()],
  });

  const model = new OpenAIImageGenerationModel({
    size: "512x512",
  });

  await model.generateImage(
    "the wicked witch of the west in the style of early 19th century painting",
    { run }
  );

  const cost = await run.calculateCost();

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 3 })}`);
})();
