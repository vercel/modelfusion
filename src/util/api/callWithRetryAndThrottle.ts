import { RetryFunction } from "./RetryFunction.js";
import { retryWithExponentialBackoff } from "./retryWithExponentialBackoff.js";
import { ThrottleFunction } from "./ThrottleFunction.js";
import { throttleUnlimitedConcurrency } from "./throttleUnlimitedConcurrency.js";

export const callWithRetryAndThrottle = async <OUTPUT>({
  retry = retryWithExponentialBackoff(),
  throttle = throttleUnlimitedConcurrency(),
  call,
}: {
  retry?: RetryFunction;
  throttle?: ThrottleFunction;
  call: () => PromiseLike<OUTPUT>;
}): Promise<OUTPUT> => retry(async () => throttle(call));
