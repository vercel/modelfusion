import { RetryFunction } from "../util/api/RetryFunction.js";
import { ThrottleFunction } from "../util/api/ThrottleFunction.js";
import { ProviderApiConfiguration } from "./ProviderApiConfiguration.js";

export abstract class AbstractProviderApiConfiguration
  implements ProviderApiConfiguration
{
  readonly baseUrl: string;

  readonly retry?: RetryFunction;
  readonly throttle?: ThrottleFunction;

  abstract readonly headers: Record<string, string>;

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

  assembleUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}
