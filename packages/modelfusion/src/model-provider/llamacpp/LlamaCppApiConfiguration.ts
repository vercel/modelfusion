import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration.js";

/**
 * Creates an API configuration for the Llama.cpp server.
 * It calls the API at http://127.0.0.1:8080 by default.
 */
export class LlamaCppApiConfiguration extends BaseUrlApiConfigurationWithDefaults {
  constructor(settings: PartialBaseUrlPartsApiConfigurationOptions = {}) {
    super({
      ...settings,
      baseUrlDefaults: {
        protocol: "http",
        host: "127.0.0.1",
        port: "8080",
        path: "",
      },
    });
  }
}
