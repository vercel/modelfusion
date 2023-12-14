import { BaseUrlApiConfiguration } from "../../core/api/BaseUrlApiConfiguration.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

export type MistralApiConfigurationSettings = {
  baseUrl?: string;
  apiKey?: string;
  retry?: RetryFunction;
  throttle?: ThrottleFunction;
};

export class MistralApiConfiguration extends BaseUrlApiConfiguration {
  constructor({
    baseUrl = "https://api.mistral.ai/v1",
    apiKey,
    retry,
    throttle,
  }: MistralApiConfigurationSettings = {}) {
    super({
      baseUrl,
      headers: {
        Authorization: `Bearer ${loadApiKey({
          apiKey,
          environmentVariableName: "MISTRAL_API_KEY",
          description: "Mistral",
        })}`,
      },
      retry,
      throttle,
    });
  }
}
