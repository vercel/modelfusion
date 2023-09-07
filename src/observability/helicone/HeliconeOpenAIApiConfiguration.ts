import { AbstractProviderApiConfiguration } from "../../model-function/AbstractProviderApiConfiguration.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { loadApiKey } from "../../util/api/loadApiKey.js";

export class HeliconeOpenAIApiConfiguration extends AbstractProviderApiConfiguration {
  readonly openAIApiKey: string;
  readonly heliconeApiKey: string;

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
    super({
      baseUrl,
      retry,
      throttle,
    });

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

  get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.openAIApiKey}`,
      "Helicone-Auth": `Bearer ${this.heliconeApiKey}`,
    };
  }
}
