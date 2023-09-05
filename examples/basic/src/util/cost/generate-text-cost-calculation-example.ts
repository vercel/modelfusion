import dotenv from "dotenv";
import {
  DefaultRun,
  OpenAICostCalculator,
  OpenAITextGenerationModel,
  calculateCost,
  generateText,
} from "modelfusion";

dotenv.config();

(async () => {
  const run = new DefaultRun();

  const text = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { run }
  );

  console.log(text);

  const cost = await calculateCost({
    calls: run.successfulModelCalls,
    costCalculators: [new OpenAICostCalculator()],
  });

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
})();
