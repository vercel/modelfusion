import { BaseUrlApiConfiguration } from "../../core/api/BaseUrlApiConfiguration.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

export class AnthropicApiConfiguration extends BaseUrlApiConfiguration {
  constructor({
    baseUrl = "https://api.anthropic.com/v1",
    apiKey,
    retry,
    throttle,
  }: {
    baseUrl?: string;
    apiKey?: string;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  } = {}) {
    super({
      baseUrl,
      headers: {
        "x-api-key": loadApiKey({
          apiKey,
          environmentVariableName: "ANTHROPIC_API_KEY",
          description: "Anthropic",
        }),
        "anthropic-version": "2023-06-01",
      },
      retry,
      throttle,
    });
  }
}
