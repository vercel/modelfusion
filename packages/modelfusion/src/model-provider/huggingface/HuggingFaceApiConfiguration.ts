import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

/**
 * Creates an API configuration for the HuggingFace API.
 * It calls the API at https://api-inference.huggingface.co/models and uses the `HUGGINGFACE_API_KEY` env variable by default.
 */
export class HuggingFaceApiConfiguration extends BaseUrlApiConfigurationWithDefaults {
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
          environmentVariableName: "HUGGINGFACE_API_KEY",
          description: "Hugging Face",
        })}`,
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api-inference.huggingface.co",
        port: "443",
        path: "/models",
      },
    });
  }
}
