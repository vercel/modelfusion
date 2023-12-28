import { Cost } from "./Cost.js";
import { CostCalculator } from "./CostCalculator.js";
import { SuccessfulModelCall } from "./SuccessfulModelCall.js";

export async function calculateCost({
  calls,
  costCalculators,
}: {
  calls: SuccessfulModelCall[];
  costCalculators: CostCalculator[];
}): Promise<Cost> {
  let costInMillicents = 0;
  const callsWithUnknownCost: SuccessfulModelCall[] = [];

  for (const call of calls) {
    const model = call.model;
    const providerCostCalculator = costCalculators.find(
      (providerCostCalculator) =>
        providerCostCalculator.provider === model.provider
    );

    if (!providerCostCalculator) {
      callsWithUnknownCost.push(call);
      continue;
    }

    const cost = await providerCostCalculator.calculateCostInMillicents(call);

    if (cost === null) {
      callsWithUnknownCost.push(call);
      continue;
    }

    costInMillicents += cost;
  }

  return new Cost({
    costInMillicents,
    hasUnknownCost: callsWithUnknownCost.length > 0,
    callsWithUnknownCost,
  });
}
