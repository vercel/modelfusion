import { RetryFunction } from "./RetryFunction";
import { retryNever } from "./retryNever";
import { ThrottleFunction } from "./ThrottleFunction";
import { throttleOff } from "./throttleOff";

export const callWithRetryAndThrottle = async <OUTPUT>({
  retry = retryNever(),
  throttle = throttleOff(),
  call,
}: {
  retry?: RetryFunction;
  throttle?: ThrottleFunction;
  call: () => PromiseLike<OUTPUT>;
}): Promise<OUTPUT> => retry(async () => throttle(call));
