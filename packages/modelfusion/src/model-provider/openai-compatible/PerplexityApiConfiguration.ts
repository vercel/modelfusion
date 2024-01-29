import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration";
import { loadApiKey } from "../../core/api/loadApiKey";
import { OpenAICompatibleApiConfiguration } from "./OpenAICompatibleApiConfiguration";

/**
 * Configuration for the Perplexity API.
 *
 * It calls the API at https://api.perplexity.ai/ and uses the `PERPLEXITY_API_KEY` api key environment variable.
 *
 * @see https://docs.perplexity.ai/reference/post_chat_completions
 */
export class PerplexityApiConfiguration
  extends BaseUrlApiConfigurationWithDefaults
  implements OpenAICompatibleApiConfiguration
{
  constructor(
    settings: PartialBaseUrlPartsApiConfigurationOptions & {
      apiKey?: string;
    } = {}
  ) {
    super({
      ...settings,
      headers: {
        Authorization: `Bearer ${loadApiKey({
          apiKey: settings.apiKey,
          environmentVariableName: "PERPLEXITY_API_KEY",
          description: "Perplexity",
        })}`,
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api.perplexity.ai",
        port: "443",
        path: "",
      },
    });
  }

  readonly provider = "openaicompatible-perplexity";
}
