import { RetryFunction } from "./RetryFunction.js";
import { retryNever } from "./retryNever.js";
import { ThrottleFunction } from "./ThrottleFunction.js";
import { throttleOff } from "./throttleOff.js";

export const callWithRetryAndThrottle = async <OUTPUT>({
  retry = retryNever(),
  throttle = throttleOff(),
  call,
}: {
  retry?: RetryFunction;
  throttle?: ThrottleFunction;
  call: () => PromiseLike<OUTPUT>;
}): Promise<OUTPUT> => retry(async () => throttle(call));
