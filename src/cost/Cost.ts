import { SuccessfulModelCall } from "../model/SuccessfulModelCall.js";

export class Cost {
  readonly costInMillicents: number;
  readonly hasUnknownCost: boolean;
  readonly callsWithUnknownCost: SuccessfulModelCall[];

  constructor({
    costInMillicents,
    hasUnknownCost,
    callsWithUnknownCost,
  }: {
    costInMillicents: number;
    hasUnknownCost: boolean;
    callsWithUnknownCost: SuccessfulModelCall[];
  }) {
    this.costInMillicents = costInMillicents;
    this.hasUnknownCost = hasUnknownCost;
    this.callsWithUnknownCost = callsWithUnknownCost;
  }

  get costInCent(): number {
    return this.costInMillicents / 1000;
  }

  get costInDollar(): number {
    return this.costInCent / 100;
  }

  formatAsDollarAmount({ decimals = 2 }: { decimals?: number } = {}) {
    return `$${this.costInDollar.toFixed(decimals)}`;
  }
}
