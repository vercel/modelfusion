import { SuccessfulModelCall } from "../model/SuccessfulModelCall.js";

export interface CostCalculator {
  readonly provider: string;

  /**
   * @return null if the cost is unknown, otherwise the cost in Millicents (0 if free)
   */
  calculateCostInMillicents(
    call: SuccessfulModelCall
  ): PromiseLike<number | null>;
}
