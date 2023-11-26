import { BaseUrlApiConfiguration } from "../../core/api/BaseUrlApiConfiguration.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

/**
 * Configuration for the Fireworks.ai API.
 *
 * It uses the `FIREWORKS_API_KEY` api key environment variable.
 *
 * @see https://readme.fireworks.ai/docs/openai-compatibility
 */
export class FireworksAIApiConfiguration extends BaseUrlApiConfiguration {
  constructor({
    baseUrl = "https://api.fireworks.ai/inference/v1",
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
          environmentVariableName: "FIREWORKS_API_KEY",
          description: "Fireworks AI",
        })}`,
      },
      retry,
      throttle,
    });
  }
}
