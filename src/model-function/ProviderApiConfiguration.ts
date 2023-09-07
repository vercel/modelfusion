import { RetryFunction } from "../util/api/RetryFunction.js";
import { ThrottleFunction } from "../util/api/ThrottleFunction.js";

/**
 * Settings for a REST provider, e.g. OpenAI or Lmnt.
 */
export interface ProviderApiConfiguration {
  /**
   * Creates a full URL given a inner path.
   */
  assembleUrl(path: string): string;

  readonly headers: Record<string, string>;

  readonly retry?: RetryFunction;
  readonly throttle?: ThrottleFunction;
}
