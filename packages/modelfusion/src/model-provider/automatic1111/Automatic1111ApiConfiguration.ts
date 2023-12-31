import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration.js";

/**
 * Creates an API configuration for the AUTOMATIC1111 Stable Diffusion Web UI API.
 * It calls the API at http://127.0.0.1:7860/sdapi/v1 by default.
 */
export class Automatic1111ApiConfiguration extends BaseUrlApiConfigurationWithDefaults {
  constructor(settings: PartialBaseUrlPartsApiConfigurationOptions = {}) {
    super({
      ...settings,
      baseUrlDefaults: {
        protocol: "http",
        host: "127.0.0.1",
        port: "7860",
        path: "/sdapi/v1",
      },
    });
  }
}
