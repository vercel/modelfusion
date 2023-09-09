import { ThrottleFunction } from "./ThrottleFunction.js";

class MaxConcurrencyThrottler {
  private maxConcurrentCalls: number;
  private activeCallCount: number;
  private callQueue: Array<() => Promise<unknown>>;

  constructor({ maxConcurrentCalls }: { maxConcurrentCalls: number }) {
    this.maxConcurrentCalls = maxConcurrentCalls;
    this.activeCallCount = 0;
    this.callQueue = [];
  }

  async run<T>(fn: () => PromiseLike<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const tryExecute = async () => {
        if (this.activeCallCount >= this.maxConcurrentCalls) return;

        // mark as active and remove from queue:
        this.activeCallCount++;
        const idx = this.callQueue.indexOf(tryExecute);
        if (idx !== -1) this.callQueue.splice(idx, 1);

        try {
          resolve(await fn());
        } catch (error) {
          reject(error);
        } finally {
          this.activeCallCount--;
          if (this.callQueue.length > 0) {
            this.callQueue[0]();
          }
        }
      };

      this.callQueue.push(tryExecute);

      if (this.activeCallCount < this.maxConcurrentCalls) {
        tryExecute();
      }
    });
  }
}

/**
 * The `throttleMaxConcurrency` strategy limits the number of parallel API calls.
 */
export function throttleMaxConcurrency({
  maxConcurrentCalls,
}: {
  maxConcurrentCalls: number;
}): ThrottleFunction {
  const throttler = new MaxConcurrencyThrottler({ maxConcurrentCalls });
  return <T>(fn: () => PromiseLike<T>) => throttler.run(fn);
}
