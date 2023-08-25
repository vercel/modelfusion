import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TranscriptionModelSettings extends ModelSettings {}

export interface TranscriptionModel<DATA, RESPONSE, SETTINGS>
  extends Model<SETTINGS> {
  generateTranscriptionResponse: (
    data: DATA,
    options?: ModelFunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;

  extractTranscriptionText: (response: RESPONSE) => string;
}
