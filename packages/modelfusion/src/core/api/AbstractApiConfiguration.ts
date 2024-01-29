import { RetryFunction } from "./RetryFunction";
import { ThrottleFunction } from "./ThrottleFunction";
import { ApiConfiguration, HeaderParameters } from "./ApiConfiguration";
import { CustomHeaderProvider } from "./CustomHeaderProvider";

export abstract class AbstractApiConfiguration implements ApiConfiguration {
  readonly retry?: RetryFunction;
  readonly throttle?: ThrottleFunction;

  protected readonly customCallHeaders: CustomHeaderProvider;

  constructor({
    retry,
    throttle,
    customCallHeaders = () => ({}),
  }: {
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
    customCallHeaders?: CustomHeaderProvider;
  }) {
    this.retry = retry;
    this.throttle = throttle;
    this.customCallHeaders = customCallHeaders;
  }

  abstract assembleUrl(path: string): string;
  protected abstract fixedHeaders(
    params: HeaderParameters
  ): Record<string, string>;

  headers(params: HeaderParameters): Record<string, string> {
    return Object.fromEntries(
      [
        ...Object.entries(this.fixedHeaders(params)),
        ...Object.entries(this.customCallHeaders(params)),
      ].filter(
        // remove undefined values:
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    );
  }
}
