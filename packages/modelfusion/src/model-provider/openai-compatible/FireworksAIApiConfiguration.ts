import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration";
import { loadApiKey } from "../../core/api/loadApiKey";
import { OpenAICompatibleApiConfiguration } from "./OpenAICompatibleApiConfiguration";

/**
 * Configuration for the Fireworks.ai API.
 *
 * It calls the API at https://api.fireworks.ai/inference/v1 and uses the `FIREWORKS_API_KEY` api key environment variable.
 *
 * @see https://readme.fireworks.ai/docs/openai-compatibility
 */
export class FireworksAIApiConfiguration
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
          environmentVariableName: "FIREWORKS_API_KEY",
          description: "Fireworks AI",
        })}`,
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api.fireworks.ai",
        port: "443",
        path: "/inference/v1",
      },
    });
  }

  readonly provider = "openaicompatible-fireworksai";
}
