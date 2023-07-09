import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TextStreamingModelSettings extends ModelSettings {}

export interface TextStreamingModel<
  PROMPT,
  SETTINGS extends TextStreamingModelSettings
> extends Model<SETTINGS> {
  generateTextStreamResponse(
    prompt: PROMPT,
    options: FunctionOptions<SETTINGS>
  ): PromiseLike<AsyncIterable<string>>;
}
