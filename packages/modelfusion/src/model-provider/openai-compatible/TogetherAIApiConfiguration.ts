import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration";
import { loadApiKey } from "../../core/api/loadApiKey";
import { OpenAICompatibleApiConfiguration } from "./OpenAICompatibleApiConfiguration";

/**
 * Configuration for the Together.ai API.
 *
 * It calls the API at https://api.together.xyz/v1 and uses the `TOGETHER_API_KEY` api key environment variable.
 *
 * @see https://docs.together.ai/docs/openai-api-compatibility
 */
export class TogetherAIApiConfiguration
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
          environmentVariableName: "TOGETHER_API_KEY",
          description: "Together AI",
        })}`,
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api.together.xyz",
        port: "443",
        path: "/v1",
      },
    });
  }

  readonly provider = "openaicompatible-togetherai";
}
