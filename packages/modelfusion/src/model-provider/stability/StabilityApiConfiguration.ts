import {
  BaseUrlPartsApiConfiguration,
  BaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlPartsApiConfiguration.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

/**
 * Creates an API configuration for the Stability AI API.
 * It calls the API at https://api.stability.ai/v1 by default.
 */
export class StabilityApiConfiguration extends BaseUrlPartsApiConfiguration {
  constructor({
    protocol = "https",
    host = "api.stability.ai",
    port = "443",
    path = "/v1",
    apiKey,
    headers,
    retry,
    throttle,
  }: Partial<BaseUrlPartsApiConfigurationOptions> & {
    apiKey?: string;
  } = {}) {
    super({
      protocol,
      host,
      port,
      path,
      headers: headers ?? {
        Authorization: `Bearer ${loadApiKey({
          apiKey,
          environmentVariableName: "STABILITY_API_KEY",
          description: "Stability",
        })}`,
      },
      retry,
      throttle,
    });
  }
}
