import {
  MistralApiConfiguration,
  MistralApiConfigurationSettings,
} from "./MistralApiConfiguration.js";
import {
  MistralTextEmbeddingModel,
  MistralTextEmbeddingModelSettings,
} from "./MistralTextEmbeddingModel.js";
import {
  MistralChatModel,
  MistralChatModelSettings,
} from "./MistralChatModel.js";

export function Api(settings: MistralApiConfigurationSettings) {
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
