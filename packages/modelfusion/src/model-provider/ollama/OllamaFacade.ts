import { PartialBaseUrlPartsApiConfigurationOptions } from "../../core/api/BaseUrlApiConfiguration";
import { OllamaApiConfiguration } from "./OllamaApiConfiguration";
import { OllamaChatModel, OllamaChatModelSettings } from "./OllamaChatModel";
import {
  OllamaCompletionModel,
  OllamaCompletionModelSettings,
} from "./OllamaCompletionModel";
import {
  OllamaTextEmbeddingModel,
  OllamaTextEmbeddingModelSettings,
} from "./OllamaTextEmbeddingModel";

/**
 * Creates an API configuration for the Ollama API.
 * It calls the API at http://127.0.0.1:11434 by default.
 */
export function Api(settings: PartialBaseUrlPartsApiConfigurationOptions) {
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
} from "./OllamaChatModel";

export * as prompt from "./OllamaCompletionPrompt";
