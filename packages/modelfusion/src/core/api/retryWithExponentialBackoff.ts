import { delay } from "../../util/delay.js";
import { getErrorMessage } from "../../util/getErrorMessage.js";
import { ApiCallError } from "./ApiCallError.js";
import { RetryError } from "./RetryError.js";
import { RetryFunction } from "./RetryFunction.js";

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
      delayInMs: initialDelayInMs,
      backoffFactor,
    });

async function _retryWithExponentialBackoff<OUTPUT>(
  f: () => PromiseLike<OUTPUT>,
  {
    maxTries,
    delayInMs,
    backoffFactor,
  }: { maxTries: number; delayInMs: number; backoffFactor: number },
  errors: unknown[] = []
): Promise<OUTPUT> {
  try {
    return await f();
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const newErrors = [...errors, error];
    const tryNumber = newErrors.length;

    if (tryNumber >= maxTries) {
      throw new RetryError({
        message: `Failed after ${tryNumber} tries. Last error: ${errorMessage}`,
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
        await delay(delayInMs);
        return _retryWithExponentialBackoff(
          f,
          { maxTries, delayInMs: backoffFactor * delayInMs, backoffFactor },
          newErrors
        );
      }
    }

    throw new RetryError({
      message: `Failed after ${tryNumber} attempt(s) with non-retryable error: '${errorMessage}'`,
      reason: "errorNotRetryable",
      errors: newErrors,
    });
  }
}
