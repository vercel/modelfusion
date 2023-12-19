import { OllamaChatModel, OllamaChatModelSettings } from "./OllamaChatModel.js";
import {
  OllamaTextEmbeddingModel,
  OllamaTextEmbeddingModelSettings,
} from "./OllamaTextEmbeddingModel.js";
import {
  OllamaCompletionModel,
  OllamaCompletionModelSettings,
} from "./OllamaCompletionModel.js";
import {
  OllamaApiConfiguration,
  OllamaApiConfigurationSettings,
} from "./OllamaApiConfiguration.js";

export function Api(settings: OllamaApiConfigurationSettings) {
  return new OllamaApiConfiguration(settings);
}

export function CompletionTextGenerator<CONTEXT_WINDOW_SIZE extends number>(
  settings: OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>
) {
  return new OllamaCompletionModel(settings);
}

export function ChatTextGenerator(settings: OllamaChatModelSettings) {
  return new OllamaChatModel(settings);
}

export function TextEmbedder(settings: OllamaTextEmbeddingModelSettings) {
  return new OllamaTextEmbeddingModel(settings);
}

export {
  OllamaChatMessage as ChatMessage,
  OllamaChatPrompt as ChatPrompt,
} from "./OllamaChatModel.js";
