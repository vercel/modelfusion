import { AbstractApiConfiguration } from "./AbstractApiConfiguration.js";
import { RetryFunction } from "./RetryFunction.js";
import { ThrottleFunction } from "./ThrottleFunction.js";

export class BaseUrlApiConfiguration extends AbstractApiConfiguration {
  readonly baseUrl: string;
  readonly headers: Record<string, string>;

  constructor({
    baseUrl,
    headers,
    retry,
    throttle,
  }: {
    baseUrl: string;
    headers: Record<string, string>;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  }) {
    super({ retry, throttle });
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  assembleUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}
