import { RetryFunction } from "./RetryFunction.js";
import { ThrottleFunction } from "./ThrottleFunction.js";
import { ApiConfiguration } from "./ApiConfiguration.js";

export abstract class AbstractApiConfiguration implements ApiConfiguration {
  readonly retry?: RetryFunction;
  readonly throttle?: ThrottleFunction;

  constructor({
    retry,
    throttle,
  }: {
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  }) {
    this.retry = retry;
    this.throttle = throttle;
  }

  abstract assembleUrl(path: string): string;
  abstract readonly headers: Record<string, string>;
}
