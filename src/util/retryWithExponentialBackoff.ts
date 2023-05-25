import { ApiCallError } from "./ApiCallError.js";
import { RetryFunction, RetryResult } from "./RetryFunction.js";

export const retryWithExponentialBackoff =
  ({ maxTries = 5, delay = 2000 } = {}): RetryFunction =>
  async <T>(f: () => PromiseLike<T>) =>
    _retryWithExponentialBackoff(f, { maxTries, delay });

export const retryNever = () => retryWithExponentialBackoff({ maxTries: 1 });

async function _retryWithExponentialBackoff<T>(
  f: () => PromiseLike<T>,
  { maxTries = 5, delay = 2000 } = {},
  tryNumber = 1
): Promise<RetryResult<T>> {
  try {
    return {
      status: "success",
      tries: tryNumber,
      result: await f(),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          status: "abort",
          tries: tryNumber,
        };
      }

      if (
        error instanceof ApiCallError &&
        (error.statusCode === 429 || // too many requests
          error.statusCode >= 500) && // internal server errors
        tryNumber < maxTries
      ) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return _retryWithExponentialBackoff(
          f,
          { maxTries, delay: 2 * delay },
          tryNumber + 1
        );
      }
    }

    return {
      status: "failure",
      tries: tryNumber,
      error,
    };
  }
}
