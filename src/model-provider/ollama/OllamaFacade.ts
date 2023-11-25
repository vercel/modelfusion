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

export function TextEmbedder(settings: OllamaTextEmbeddingModelSettings) {
  return new OllamaTextEmbeddingModel(settings);
}
