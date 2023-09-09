import { BaseUrlApiConfiguration } from "../../core/api/BaseUrlApiConfiguration.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

export class StabilityApiConfiguration extends BaseUrlApiConfiguration {
  constructor({
    baseUrl = "https://api.stability.ai/v1",
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
        Authorization: `Bearer ${loadApiKey({
          apiKey,
          environmentVariableName: "STABILITY_API_KEY",
          description: "Stability",
        })}`,
      },
      retry,
      throttle,
    });
  }
}
