import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { PartialBaseUrlPartsApiConfigurationOptions } from "../../core/api/BaseUrlApiConfiguration.js";
import { LlamaCppApiConfiguration } from "./LlamaCppApiConfiguration.js";
import {
  LlamaCppCompletionModel,
  LlamaCppCompletionModelSettings,
} from "./LlamaCppCompletionModel.js";
import {
  LlamaCppTextEmbeddingModel,
  LlamaCppTextEmbeddingModelSettings,
} from "./LlamaCppTextEmbeddingModel.js";
import { LlamaCppTokenizer } from "./LlamaCppTokenizer.js";

/**
 * Creates an API configuration for the Llama.cpp server.
 * It calls the API at http://127.0.0.1:8080 by default.
 */
export function Api(settings: PartialBaseUrlPartsApiConfigurationOptions) {
  return new LlamaCppApiConfiguration(settings);
}

export function CompletionTextGenerator<CONTEXT_WINDOW_SIZE extends number>(
  settings: LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE> = {}
) {
  return new LlamaCppCompletionModel<CONTEXT_WINDOW_SIZE>(settings);
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

/**
 * GBNF grammars. You can use them in the `grammar` option of the `TextGenerator` model.
 */
export * as grammar from "./LlamaCppGrammars.js";

export * as prompt from "./LlamaCppPrompt.js";
