import { AbstractProviderApiConfiguration } from "../../model-function/AbstractProviderApiConfiguration.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { loadApiKey } from "../../util/api/loadApiKey.js";

export class OpenAIApiConfiguration extends AbstractProviderApiConfiguration {
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
