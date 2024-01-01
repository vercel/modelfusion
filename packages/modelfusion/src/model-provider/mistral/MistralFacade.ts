import { PartialBaseUrlPartsApiConfigurationOptions } from "../../core/api/BaseUrlApiConfiguration.js";
import { MistralApiConfiguration } from "./MistralApiConfiguration.js";
import {
  MistralChatModel,
  MistralChatModelSettings,
} from "./MistralChatModel.js";
import {
  MistralTextEmbeddingModel,
  MistralTextEmbeddingModelSettings,
} from "./MistralTextEmbeddingModel.js";

/**
 * Creates an API configuration for the Mistral API.
 * It calls the API at https://api.mistral.ai/v1 and uses the `MISTRAL_API_KEY` env variable by default.
 */
export function Api(
  settings: PartialBaseUrlPartsApiConfigurationOptions & {
    apiKey?: string;
  }
) {
  return new MistralApiConfiguration(settings);
}

export function ChatTextGenerator(settings: MistralChatModelSettings) {
  return new MistralChatModel(settings);
}

export function TextEmbedder(settings: MistralTextEmbeddingModelSettings) {
  return new MistralTextEmbeddingModel(settings);
}

export {
  MistralChatMessage as ChatMessage,
  MistralChatPrompt as ChatPrompt,
} from "./MistralChatModel.js";
