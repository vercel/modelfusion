import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "../../core/api/BaseUrlApiConfiguration";
import { loadApiKey } from "../../core/api/loadApiKey";
import { OpenAICompatibleApiConfiguration } from "./OpenAICompatibleApiConfiguration";

/**
 * Configuration for the MiniMax API.
 *
 * It calls the API at https://api.minimax.io/v1 and uses the `MINIMAX_API_KEY` api key environment variable.
 *
 * @see https://platform.minimaxi.com/document/Fast%20access
 */
export class MiniMaxApiConfiguration
  extends BaseUrlApiConfigurationWithDefaults
  implements OpenAICompatibleApiConfiguration
{
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
          environmentVariableName: "MINIMAX_API_KEY",
          description: "MiniMax",
        })}`,
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api.minimax.io",
        port: "443",
        path: "/v1",
      },
    });
  }

  readonly provider = "openaicompatible-minimax" as const;
}
