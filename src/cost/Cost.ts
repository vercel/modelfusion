import { SuccessfulModelCall } from "./SuccessfulModelCall.js";

export class Cost {
  readonly costInMillicent: number;
  readonly hasUnknownCost: boolean;
  readonly callsWithUnknownCost: SuccessfulModelCall[];

  constructor({
    costInMillicent,
    hasUnknownCost,
    callsWithUnknownCost,
  }: {
    costInMillicent: number;
    hasUnknownCost: boolean;
    callsWithUnknownCost: SuccessfulModelCall[];
  }) {
    this.costInMillicent = costInMillicent;
    this.hasUnknownCost = hasUnknownCost;
    this.callsWithUnknownCost = callsWithUnknownCost;
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
