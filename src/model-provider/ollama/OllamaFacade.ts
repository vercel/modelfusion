import { OllamaChatModel, OllamaChatModelSettings } from "./OllamaChatModel.js";
import {
  OllamaTextEmbeddingModel,
  OllamaTextEmbeddingModelSettings,
} from "./OllamaTextEmbeddingModel.js";
import {
  OllamaTextGenerationModel,
  OllamaTextGenerationModelSettings,
} from "./OllamaTextGenerationModel.js";

export function TextGenerator<CONTEXT_WINDOW_SIZE extends number>(
  settings: OllamaTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>
) {
  return new OllamaTextGenerationModel(settings);
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
