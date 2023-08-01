import {
  DefaultRun,
  OpenAICostCalculator,
  OpenAITextGenerationModel,
  generateText,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const run = new DefaultRun({
    costCalculators: [new OpenAICostCalculator()],
  });

  const { text } = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      temperature: 0.7,
      maxTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { run }
  );

  console.log(text);

  const cost = await run.calculateCost();

  console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
})();
