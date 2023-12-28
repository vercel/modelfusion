---
sidebar_position: 50
---

# Cost Calculation

Calls to generative models such as OpenAI's API can get expensive quickly. To keep track of your costs and to enable you to understand them, ModelFusion contains cost calculation functionality. You can use it to log the costs of [runs](/guide/util/run) or even implement budgeting that automatically aborts a run when it exceeds a certain cost.

> ⚠️ Cost calculation is currently only supported for OpenAI models. It depends on the current pricing of the API. The cost calculation can be inaccurate when the pricing changes or when there are e.g. aborted calls.

### Example

```ts
import { DefaultRun, generateText, openai } from "modelfusion";
import {
  OpenAICostCalculator,
  calculateCost,
  extractSuccessfulModelCalls,
} from "modelfusion-experimental";

const run = new DefaultRun();

const text = await generateText(
  openai.CompletionTextGenerator({
    model: "gpt-3.5-turbo-instruct",
    temperature: 0.7,
    maxGenerationTokens: 500,
  }),
  "Write a short story about a robot learning to love:\n\n",
  { run } // pass in the run into the model calls
);

// calculate the overall cost of the run for the successful calls:
const cost = await calculateCost({
  calls: extractSuccessfulModelCalls(run.events),
  costCalculators: [new OpenAICostCalculator()],
});

console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
```
