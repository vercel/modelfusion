import { BaseUrlApiConfiguration } from "../../core/api/BaseUrlApiConfiguration.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

export class HuggingFaceApiConfiguration extends BaseUrlApiConfiguration {
  constructor({
    baseUrl = "https://api-inference.huggingface.co/models",
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
          environmentVariableName: "HUGGINGFACE_API_KEY",
          description: "Hugging Face",
        })}`,
      },
      retry,
      throttle,
    });
  }
}
