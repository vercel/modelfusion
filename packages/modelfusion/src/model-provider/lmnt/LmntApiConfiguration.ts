import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

/**
 * Creates an API configuration for the LMNT API.
 * It calls the API at https://api.lmnt.com/v1 and uses the `LMNT_API_KEY` env variable by default.
 */
export class LmntApiConfiguration extends BaseUrlApiConfigurationWithDefaults {
  constructor(
    settings: PartialBaseUrlPartsApiConfigurationOptions & {
      apiKey?: string;
    } = {}
  ) {
    super({
      ...settings,
      headers: {
        "X-API-Key": loadApiKey({
          apiKey: settings.apiKey,
          environmentVariableName: "LMNT_API_KEY",
          description: "LMNT",
        }),
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api.lmnt.com",
        port: "443",
        path: "/v1",
      },
    });
  }
}
