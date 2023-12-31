import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration.js";

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
