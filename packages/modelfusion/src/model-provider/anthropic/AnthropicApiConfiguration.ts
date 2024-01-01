import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

/**
 * Creates an API configuration for the Anthropic API.
 * It calls the API at https://api.anthropic.com/v1 and uses the `ANTHROPIC_API_KEY` env variable by default.
 */
export class AnthropicApiConfiguration extends BaseUrlApiConfigurationWithDefaults {
  constructor(
    settings: PartialBaseUrlPartsApiConfigurationOptions & {
      apiKey?: string;
    } = {}
  ) {
    super({
      ...settings,
      headers: {
        "x-api-key": loadApiKey({
          apiKey: settings.apiKey,
          environmentVariableName: "ANTHROPIC_API_KEY",
          description: "Anthropic",
        }),
        "anthropic-version": "2023-06-01",
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api.anthropic.com",
        port: "443",
        path: "/v1",
      },
    });
  }
}
