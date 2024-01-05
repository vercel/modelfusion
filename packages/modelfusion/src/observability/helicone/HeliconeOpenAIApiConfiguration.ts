import { BaseUrlApiConfiguration } from "../../core/api/BaseUrlApiConfiguration.js";
import { CustomHeaderProvider } from "../../core/api/CustomHeaderProvider.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

export class HeliconeOpenAIApiConfiguration extends BaseUrlApiConfiguration {
  constructor({
    baseUrl = "https://oai.hconeai.com/v1",
    openAIApiKey,
    heliconeApiKey,
    retry,
    throttle,
    customCallHeaders,
  }: {
    baseUrl?: string;
    openAIApiKey?: string;
    heliconeApiKey?: string;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
    customCallHeaders?: CustomHeaderProvider;
  } = {}) {
    super({
      baseUrl,
      headers: {
        Authorization: `Bearer ${loadApiKey({
          apiKey: openAIApiKey,
          environmentVariableName: "OPENAI_API_KEY",
          apiKeyParameterName: "openAIApiKey",
          description: "OpenAI",
        })}`,
        "Helicone-Auth": `Bearer ${loadApiKey({
          apiKey: heliconeApiKey,
          environmentVariableName: "HELICONE_API_KEY",
          apiKeyParameterName: "heliconeApiKey",
          description: "Helicone",
        })}`,
      },
      retry,
      throttle,
      customCallHeaders,
    });
  }
}
