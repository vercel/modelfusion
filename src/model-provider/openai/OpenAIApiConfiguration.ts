import { BasicApiConfiguration } from "../../core/api/BasicApiConfiguration.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

export class OpenAIApiConfiguration extends BasicApiConfiguration {
  readonly apiKey: string;

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
    super({
      baseUrl,
      retry,
      throttle,
    });

    this.apiKey = loadApiKey({
      apiKey,
      environmentVariableName: "OPENAI_API_KEY",
      description: "OpenAI",
    });
  }

  get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }
}
