import { ProviderApiConfiguration } from "../../model-function/ProviderApiConfiguration.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";

export class OpenAIApiConfiguration implements ProviderApiConfiguration {
  readonly baseUrl: string;
  readonly apiKey: string;

  readonly retry?: RetryFunction;
  readonly throttle?: ThrottleFunction;

  constructor({
    baseUrl = "https://api.openai.com/v1",
    apiKey,
    retry,
    throttle,
  }: {
    baseUrl?: string;
    apiKey?: string;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  } = {}) {
    this.baseUrl = baseUrl;
    this.retry = retry;
    this.throttle = throttle;

    apiKey ??= process.env.OPENAI_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `OpenAI API key is missing. Pass it using the 'apiKey' parameter or set it as an environment variable named OPENAI_API_KEY.`
      );
    }

    this.apiKey = apiKey;
  }

  assembleUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }
}
