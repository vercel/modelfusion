import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

/**
 * Creates an API configuration for the Mistral API.
 * It calls the API at https://api.mistral.ai/v1 and uses the `MISTRAL_API_KEY` env variable by default.
 */
export class MistralApiConfiguration extends BaseUrlApiConfigurationWithDefaults {
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
          environmentVariableName: "MISTRAL_API_KEY",
          description: "Mistral",
        })}`,
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api.mistral.ai",
        port: "443",
        path: "/v1",
      },
    });
  }
}
