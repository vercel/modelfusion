import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

/**
 * Creates an API configuration for the Cohere API.
 * It calls the API at https://api.cohere.ai/v1 and uses the `COHERE_API_KEY` env variable by default.
 */
export class CohereApiConfiguration extends BaseUrlApiConfigurationWithDefaults {
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
          environmentVariableName: "COHERE_API_KEY",
          description: "Cohere",
        })}`,
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api.cohere.ai",
        port: "443",
        path: "/v1",
      },
    });
  }
}
