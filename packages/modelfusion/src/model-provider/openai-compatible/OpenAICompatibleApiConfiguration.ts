import { ApiConfiguration } from "../../core/api/ApiConfiguration";

export type OpenAICompatibleProviderName =
  | `openaicompatible`
  | `openaicompatible-${string}`;

export interface OpenAICompatibleApiConfiguration extends ApiConfiguration {
  provider?: OpenAICompatibleProviderName;
}
