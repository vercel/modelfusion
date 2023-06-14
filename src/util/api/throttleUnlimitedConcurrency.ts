import { ThrottleFunction } from "./ThrottleFunction.js";

/**
 * The `throttleUnlimitedConcurrency` strategy does not limit parallel API calls.
 */
export const throttleUnlimitedConcurrency = (): ThrottleFunction => (fn) =>
  fn();
