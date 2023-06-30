import { Cost } from "./Cost.js";
import { ProviderCostCalculator } from "./ProviderCostCalculator.js";
import { SuccessfulModelCall } from "./SuccessfulModelCall.js";

export class CostCalculator {
  readonly providerCostCalculators: ProviderCostCalculator[];

  constructor({
    providerCostCalculators,
  }: {
    providerCostCalculators: ProviderCostCalculator[];
  }) {
    this.providerCostCalculators = providerCostCalculators;
  }

  async calculateCost(calls: SuccessfulModelCall[]): Promise<Cost> {
    let costInMillicents = 0;
    const callsWithUnknownCost: SuccessfulModelCall[] = [];

    for (const call of calls) {
      const model = call.model;
      const providerCostCalculator = this.providerCostCalculators.find(
        (providerCostCalculator) =>
          providerCostCalculator.provider === model.provider
      );

      if (!providerCostCalculator) {
        callsWithUnknownCost.push(call);
        continue;
      }

      const cost = await providerCostCalculator.calculateCostInMillicents({
        model: model.modelName,
        call,
      });

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
}
