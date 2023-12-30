import { BaseUrlApiConfiguration } from "../../core/api/BaseUrlApiConfiguration.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

/**
 * Configuration for the Together.ai API.
 *
 * It uses the `TOGETHER_API_KEY` api key environment variable.
 *
 * @see https://docs.together.ai/docs/openai-api-compatibility
 */
export class TogetherAIApiConfiguration extends BaseUrlApiConfiguration {
  constructor({
    baseUrl = "https://api.together.xyz/v1",
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
          environmentVariableName: "TOGETHER_API_KEY",
          description: "Together AI",
        })}`,
      },
      retry,
      throttle,
    });
  }
}
