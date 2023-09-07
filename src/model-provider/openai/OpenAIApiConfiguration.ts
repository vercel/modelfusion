import { ProviderApiConfiguration } from "../../model-function/ProviderApiConfiguration.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { loadApiKey } from "../../util/api/loadApiKey.js";

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

    this.apiKey = loadApiKey({
      apiKey,
      environmentVariableName: "OPENAI_API_KEY",
      description: "OpenAI",
    });
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
