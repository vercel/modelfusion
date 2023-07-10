import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";
import { DeltaEvent } from "./DeltaEvent.js";

export interface TextStreamingModelSettings extends ModelSettings {}

export interface TextStreamingModel<
  PROMPT,
  FULL_DELTA,
  SETTINGS extends TextStreamingModelSettings
> extends Model<SETTINGS> {
  generateDeltaStreamResponse(
    prompt: PROMPT,
    options: FunctionOptions<SETTINGS>
  ): PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>;

  extractTextDelta(fullDelta: FULL_DELTA): string | undefined;
}
