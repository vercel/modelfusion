import { ModelCallFinishedEvent } from "../model/ModelCallObserver.js";

export class Cost {
  readonly costInMillicent: number;
  readonly hasUnknownCost: boolean;
  readonly eventsWithUnknownCost: ModelCallFinishedEvent[];

  constructor({
    costInMillicent,
    hasUnknownCost,
    eventsWithUnknownCost,
  }: {
    costInMillicent: number;
    hasUnknownCost: boolean;
    eventsWithUnknownCost: ModelCallFinishedEvent[];
  }) {
    this.costInMillicent = costInMillicent;
    this.hasUnknownCost = hasUnknownCost;
    this.eventsWithUnknownCost = eventsWithUnknownCost;
  }

  get costInCent(): number {
    return this.costInMillicent / 1000;
  }

  get costInDollar(): number {
    return this.costInCent / 100;
  }

  formatAsDollarAmount({ decimals = 2 }: { decimals?: number } = {}) {
    return `$${this.costInDollar.toFixed(decimals)}`;
  }
}
