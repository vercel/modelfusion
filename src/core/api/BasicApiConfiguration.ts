import { RetryFunction } from "./RetryFunction.js";
import { ThrottleFunction } from "./ThrottleFunction.js";
import { ApiConfiguration } from "./ApiConfiguration.js";

export class BasicApiConfiguration implements ApiConfiguration {
  readonly baseUrl: string;

  readonly retry?: RetryFunction;
  readonly throttle?: ThrottleFunction;

  constructor({
    baseUrl,
    retry,
    throttle,
  }: {
    baseUrl: string;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  }) {
    this.baseUrl = baseUrl;
    this.retry = retry;
    this.throttle = throttle;
  }

  get headers(): Record<string, string> {
    return {};
  }

  assembleUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}
