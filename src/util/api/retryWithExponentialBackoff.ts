import { ApiCallError } from "./ApiCallError.js";
import { RetryFunction } from "./RetryFunction.js";
import { RetryError } from "./RetryError.js";

/**
 * The `retryWithExponentialBackoff` strategy retries a failed API call with an exponential backoff.
 * You can configure the maximum number of tries, the initial delay, and the backoff factor.
 */
export const retryWithExponentialBackoff =
  ({
    maxTries = 3,
    initialDelayInMs = 2000,
    backoffFactor = 2,
  } = {}): RetryFunction =>
  async <OUTPUT>(f: () => PromiseLike<OUTPUT>) =>
    _retryWithExponentialBackoff(f, {
      maxTries,
      delay: initialDelayInMs,
      backoffFactor,
    });

async function _retryWithExponentialBackoff<OUTPUT>(
  f: () => PromiseLike<OUTPUT>,
  {
    maxTries,
    delay,
    backoffFactor,
  }: { maxTries: number; delay: number; backoffFactor: number },
  errors: unknown[] = []
): Promise<OUTPUT> {
  try {
    return await f();
  } catch (error) {
    const newErrors = [...errors, error];
    const tryNumber = newErrors.length;

    if (tryNumber >= maxTries) {
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
        error.isRetryable &&
        tryNumber < maxTries
      ) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return _retryWithExponentialBackoff(
          f,
          { maxTries, delay: backoffFactor * delay, backoffFactor },
          newErrors
        );
      }
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    throw new RetryError({
      message: `Failed after ${tryNumber} attempt(s) with non-retryable error: '${errorMessage}'`,
      reason: "errorNotRetryable",
      errors: newErrors,
    });
  }
}
