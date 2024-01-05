import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

/**
 * Creates an API configuration for ElevenLabs API.
 * It calls the API at https://api.elevenlabs.io/v1 and uses the `ELEVENLABS_API_KEY` env variable by default.
 */
export class ElevenLabsApiConfiguration extends BaseUrlApiConfigurationWithDefaults {
  constructor(
    settings: PartialBaseUrlPartsApiConfigurationOptions & {
      apiKey?: string;
    } = {}
  ) {
    super({
      ...settings,
      headers: {
        "xi-api-key": loadApiKey({
          apiKey: settings.apiKey,
          environmentVariableName: "ELEVENLABS_API_KEY",
          description: "ElevenLabs",
        }),
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api.elevenlabs.io",
        port: "443",
        path: "/v1",
      },
    });
  }

  get apiKey() {
    return this.fixedHeadersValue["xi-api-key"];
  }
}
