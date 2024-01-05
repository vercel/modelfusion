import { Run } from "../Run.js";
import { RetryFunction } from "./RetryFunction.js";
import { ThrottleFunction } from "./ThrottleFunction.js";

export type HeaderParameters = {
  functionType: string;
  functionId?: string;
  run?: Run;
  callId: string;
};

/**
 * Settings for how to call an API, e.g. OpenAI.
 *
 * This interfaces enables creating pre-defined API configuration for certain API (e.g., OpenAI),
 * pre-defined proxy configurations (e.g. Helicone OpenAI),
 * and fully custom setups (e.g. your own internal OpenAI proxy with custom headers).
 */
export interface ApiConfiguration {
  /**
   * Creates a full URL given a inner path.
   *
   * The inner path always starts with a slash, e.g. `/generate`.
   */
  assembleUrl(path: string): string;

  /**
   * Returns the headers that should be included in every request to the API.
   * This is intended for authentication headers and proxy settings.
   *
   * The model may add additional headers, in particular "Content-Type"."
   *
   * @param params Parameters that can be used to create the headers.
   */
  headers(params: HeaderParameters): Record<string, string>;

  /**
   * Defines how failed API calls should be retried.
   */
  readonly retry?: RetryFunction;

  /**
   * Defines how API calls should be rate limited.
   */
  readonly throttle?: ThrottleFunction;
}
