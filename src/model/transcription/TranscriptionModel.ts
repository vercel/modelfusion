import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TranscriptionModelSettings extends ModelSettings {}

export interface TranscriptionModel<DATA, RESPONSE, SETTINGS>
  extends Model<SETTINGS> {
  generateTranscriptionResponse: (
    data: DATA,
    options?: FunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;

  extractTranscriptionText: (response: RESPONSE) => string;
}
