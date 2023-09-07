import { ProviderApiConfiguration } from "../../model-function/ProviderApiConfiguration.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { loadApiKey } from "../../util/api/loadApiKey.js";

export class HeliconeOpenAIApiConfiguration
  implements ProviderApiConfiguration
{
  readonly baseUrl: string;

  readonly openAIApiKey: string;
  readonly heliconeApiKey: string;

  readonly retry?: RetryFunction;
  readonly throttle?: ThrottleFunction;

  constructor({
    baseUrl = "https://oai.hconeai.com/v1",
    openAIApiKey,
    heliconeApiKey,
    retry,
    throttle,
  }: {
    baseUrl?: string;
    openAIApiKey?: string;
    heliconeApiKey?: string;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  } = {}) {
    this.baseUrl = baseUrl;
    this.retry = retry;
    this.throttle = throttle;

    this.openAIApiKey = loadApiKey({
      apiKey: openAIApiKey,
      environmentVariableName: "OPENAI_API_KEY",
      apiKeyParameterName: "openAIApiKey",
      description: "OpenAI",
    });

    this.heliconeApiKey = loadApiKey({
      apiKey: heliconeApiKey,
      environmentVariableName: "HELICONE_API_KEY",
      apiKeyParameterName: "heliconeApiKey",
      description: "Helicone",
    });
  }

  assembleUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.openAIApiKey}`,
      "Helicone-Auth": `Bearer ${this.heliconeApiKey}`,
    };
  }
}
