import { SuccessfulModelCall } from "./SuccessfulModelCall.js";

export interface ProviderCostCalculator {
  readonly provider: string;

  /**
   * @return null if the cost is unknown, otherwise the cost in millicent (0 if free)
   */
  calculateCostInMillicent(options: {
    model: string | null;
    event: SuccessfulModelCall;
  }): PromiseLike<number | null>;
}
