import {
  LlamaCppBindingsCompletionModel,
  LlamaCppBindingsCompletionModelSettings,
} from "./LlamaCppBindingsCompletionModel.js";

export function CompletionTextGenerator<CONTEXT_WINDOW_SIZE extends number>(
  settings: LlamaCppBindingsCompletionModelSettings<CONTEXT_WINDOW_SIZE> = {}
) {
  return new LlamaCppBindingsCompletionModel(settings);
}
