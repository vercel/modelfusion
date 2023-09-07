import { BasicApiConfiguration } from "../../model-function/BasicApiConfiguration.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { loadApiKey } from "../../util/api/loadApiKey.js";

export class HuggingFaceApiConfiguration extends BasicApiConfiguration {
  readonly apiKey: string;

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
      retry,
      throttle,
    });

    this.apiKey = loadApiKey({
      apiKey,
      environmentVariableName: "HUGGINGFACE_API_KEY",
      description: "Hugging Face",
    });
  }

  get headers(): Record<string, string> {
    return { Authorization: `Bearer ${this.apiKey}` };
  }
}
