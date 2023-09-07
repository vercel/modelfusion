import { ProviderApiConfiguration } from "../../model-function/ProviderApiConfiguration.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";

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

    openAIApiKey ??= process.env.OPENAI_API_KEY;

    if (openAIApiKey == null) {
      throw new Error(
        `OpenAI API key is missing. Pass it using the 'apiKey' parameter or set it as an environment variable named OPENAI_API_KEY.`
      );
    }

    this.openAIApiKey = openAIApiKey;

    heliconeApiKey ??= process.env.HELICONE_API_KEY;

    if (heliconeApiKey == null) {
      throw new Error(
        `Helicone API key is missing. Pass it using the 'apiKey' parameter or set it as an environment variable named HELICONE_API_KEY.`
      );
    }

    this.heliconeApiKey = heliconeApiKey;
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
