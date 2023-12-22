import { AbstractApiConfiguration } from "./AbstractApiConfiguration.js";
import { RetryFunction } from "./RetryFunction.js";
import { ThrottleFunction } from "./ThrottleFunction.js";

export type BaseUrlPartsApiConfigurationOptions = {
  protocol: string;
  host: string;
  port: string;
  path: string;
  headers: Record<string, string>;
  retry?: RetryFunction;
  throttle?: ThrottleFunction;
};

/**
 * An API configuration that uses different URL parts and a set of headers.
 *
 * You can use it to configure custom APIs for models, e.g. your own internal OpenAI proxy with custom headers.
 */
export class BaseUrlPartsApiConfiguration extends AbstractApiConfiguration {
  readonly protocol: string;
  readonly host: string;
  readonly port: string;
  readonly path: string;
  readonly headers: Record<string, string>;

  constructor({
    protocol,
    host,
    port,
    path,
    headers,
    retry,
    throttle,
  }: BaseUrlPartsApiConfigurationOptions) {
    super({ retry, throttle });
    this.protocol = protocol;
    this.host = host;
    this.port = port;
    this.path = path;
    this.headers = headers;
  }

  assembleUrl(path: string): string {
    return `${this.protocol}://${this.host}:${this.port}${this.path}${path}`;
  }
}
