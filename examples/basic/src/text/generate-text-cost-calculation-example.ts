import {
  DefaultRun,
  OpenAICostCalculator,
  OpenAITextGenerationModel,
} from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const model = new OpenAITextGenerationModel({
    model: "text-davinci-003",
    temperature: 0.7,
    maxTokens: 500,
  });

  const run = new DefaultRun({
    costCalculators: [new OpenAICostCalculator()],
  });

  const text = await model.generateText(
    "Write a short story about a robot learning to love:\n\n",
    { run }
  );

  console.log(text);

  const cost = await run.calculateCost();

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
})();
