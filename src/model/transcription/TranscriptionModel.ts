import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TranscriptionModelSettings extends ModelSettings {}

export interface TranscriptionModel<
  DATA,
  SETTINGS extends TranscriptionModelSettings
> extends Model<SETTINGS> {
  transcribe(
    data: DATA,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<string>;
}
