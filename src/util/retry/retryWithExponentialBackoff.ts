import { ApiCallError } from "../ApiCallError.js";
import { RetryFunction } from "./RetryFunction.js";
import { RetryError } from "./RetryError.js";

export const retryWithExponentialBackoff =
  ({ maxTries = 5, delay = 2000 } = {}): RetryFunction =>
  async <OUTPUT>(f: () => PromiseLike<OUTPUT>) =>
    _retryWithExponentialBackoff(f, { maxTries, delay });

async function _retryWithExponentialBackoff<OUTPUT>(
  f: () => PromiseLike<OUTPUT>,
  { maxTries = 5, delay = 2000 } = {},
  errors: unknown[] = []
): Promise<OUTPUT> {
  try {
    return await f();
  } catch (error) {
    const newErrors = [...errors, error];
    const tryNumber = newErrors.length;

    if (tryNumber > maxTries) {
      throw new RetryError({
        message: `Failed after ${tryNumber} tries.`,
        reason: "maxTriesExceeded",
        errors: newErrors,
      });
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw error;
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
          newErrors
        );
      }
    }

    throw new RetryError({
      message: `Failed after ${tryNumber} tries with an error that is not retryable.`,
      reason: "errorNotRetryable",
      errors: newErrors,
    });
  }
}
