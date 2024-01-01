import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

/**
 * Creates an API configuration for the OpenAI API.
 * It calls the API at https://api.openai.com/v1 and uses the `OPENAI_API_KEY` env variable by default.
 */
export class OpenAIApiConfiguration extends BaseUrlApiConfigurationWithDefaults {
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
          environmentVariableName: "OPENAI_API_KEY",
          description: "OpenAI",
        })}`,
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api.openai.com",
        port: "443",
        path: "/v1",
      },
    });
  }
}
