import { ModelCallFinishedEvent } from "../model/ModelCallObserver.js";
import { Cost } from "./Cost.js";
import { ProviderCostCalculator } from "./ProviderCostCalculator.js";

export class CostCalculator {
  readonly providerCostCalculators: ProviderCostCalculator[];

  constructor({
    providerCostCalculators,
  }: {
    providerCostCalculators: ProviderCostCalculator[];
  }) {
    this.providerCostCalculators = providerCostCalculators;
  }

  async calculateCostInMillicent(
    events: ModelCallFinishedEvent[]
  ): Promise<Cost> {
    let costInMillicent = 0;
    const eventsWithUnknownCost: ModelCallFinishedEvent[] = [];

    for (const event of events) {
      if (event.status !== "success") {
        continue;
      }

      const model = event.metadata.model;
      const providerCostCalculator = this.providerCostCalculators.find(
        (providerCostCalculator) =>
          providerCostCalculator.provider === model.provider
      );

      if (!providerCostCalculator) {
        eventsWithUnknownCost.push(event);
        continue;
      }

      const cost = await providerCostCalculator.calculateCostInMillicent({
        model: model.modelName,
        event,
      });

      if (cost === null) {
        eventsWithUnknownCost.push(event);
        continue;
      }

      costInMillicent += cost;
    }

    return Promise.resolve(
      new Cost({
        costInMillicent,
        hasUnknownCost: eventsWithUnknownCost.length > 0,
        eventsWithUnknownCost,
      })
    );
  }
}
