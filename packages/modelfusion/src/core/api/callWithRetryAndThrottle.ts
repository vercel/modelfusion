import { RetryFunction } from "./RetryFunction.js";
import { retryWithExponentialBackoff } from "./retryWithExponentialBackoff.js";
import { ThrottleFunction } from "./ThrottleFunction.js";
import { throttleOff } from "./throttleOff.js";

export const callWithRetryAndThrottle = async <OUTPUT>({
  retry = retryWithExponentialBackoff(),
  throttle = throttleOff(),
  call,
}: {
  retry?: RetryFunction;
  throttle?: ThrottleFunction;
  call: () => PromiseLike<OUTPUT>;
}): Promise<OUTPUT> => retry(async () => throttle(call));
