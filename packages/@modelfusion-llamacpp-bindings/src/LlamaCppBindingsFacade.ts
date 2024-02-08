import { LlamaCppCompletionModelSettings } from "modelfusion";
import { LlamaCppBindingsCompletionModel } from "./LlamaCppBindingsCompletionModel.js";

export function CompletionTextGenerator<CONTEXT_WINDOW_SIZE extends number>(
  settings: LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE> = {}
) {
  return new LlamaCppBindingsCompletionModel(settings);
}
