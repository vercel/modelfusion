import { TextPromptModel } from "index.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { ModelSettings } from "../Model.js";
import { DeltaEvent } from "./DeltaEvent.js";

export interface TextStreamingModelSettings extends ModelSettings {}

export interface TextStreamingModel<
  PROMPT,
  FULL_DELTA,
  SETTINGS extends TextStreamingModelSettings,
> extends TextPromptModel<PROMPT, SETTINGS> {
  generateDeltaStreamResponse(
    prompt: PROMPT,
    options: FunctionOptions<SETTINGS>
  ): PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>;

  extractTextDelta(fullDelta: FULL_DELTA): string | undefined;
}
