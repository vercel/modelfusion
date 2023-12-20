import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { LlamaCppApiConfiguration } from "./LlamaCppApiConfiguration.js";
import {
  LlamaCppTextEmbeddingModel,
  LlamaCppTextEmbeddingModelSettings,
} from "./LlamaCppTextEmbeddingModel.js";
import {
  LlamaCppTextGenerationModel,
  LlamaCppTextGenerationModelSettings,
} from "./LlamaCppTextGenerationModel.js";
import { LlamaCppTokenizer } from "./LlamaCppTokenizer.js";

export function TextGenerator<CONTEXT_WINDOW_SIZE extends number>(
  settings: LlamaCppTextGenerationModelSettings<CONTEXT_WINDOW_SIZE> = {}
) {
  return new LlamaCppTextGenerationModel<CONTEXT_WINDOW_SIZE>(settings);
}

export function TextEmbedder(
  settings: LlamaCppTextEmbeddingModelSettings = {}
) {
  return new LlamaCppTextEmbeddingModel(settings);
}

export function Tokenizer(
  api: ApiConfiguration = new LlamaCppApiConfiguration()
) {
  return new LlamaCppTokenizer(api);
}
