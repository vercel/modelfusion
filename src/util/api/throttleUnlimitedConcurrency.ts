import { ThrottleFunction } from "./ThrottleFunction.js";

export const throttleUnlimitedConcurrency = (): ThrottleFunction => (fn) =>
  fn();
