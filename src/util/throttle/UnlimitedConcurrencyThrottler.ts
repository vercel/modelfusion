import { ThrottleFunction } from "./ThrottleFunction.js";
import { Throttler } from "./Throttler.js";

export class UnlimitedConcurrencyThrottler implements Throttler {
  async run<T>(fn: () => PromiseLike<T>): Promise<T> {
    return fn();
  }

  asFunction() {
    return <T>(fn: () => PromiseLike<T>) => fn();
  }
}

export function throttleUnlimitedConcurrency(): ThrottleFunction {
  return new UnlimitedConcurrencyThrottler().asFunction();
}
