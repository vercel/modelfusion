import {
  LlamaCppCompletionModelSettings,
  LlamaCppCompletionModel,
} from "modelfusion";

export class LlamaCppBindingsCompletionModel<
  CONTEXT_WINDOW_SIZE extends number | undefined,
> extends LlamaCppCompletionModel<CONTEXT_WINDOW_SIZE> {
  constructor(settings: LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>) {
    super(settings);
  }
}
