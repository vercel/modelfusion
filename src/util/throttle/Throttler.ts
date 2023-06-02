import { ThrottleFunction } from "./ThrottleFunction.js";

export interface Throttler {
  run<T>(fn: () => PromiseLike<T>): PromiseLike<T>;
  asFunction(): ThrottleFunction;
}
