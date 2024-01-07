import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TranscriptionModelSettings extends ModelSettings {}

export interface TranscriptionModel<
  DATA,
  SETTINGS extends TranscriptionModelSettings = TranscriptionModelSettings,
> extends Model<SETTINGS> {
  doTranscribe: (
    data: DATA,
    options: FunctionCallOptions
  ) => PromiseLike<{
    rawResponse: unknown;
    transcription: string;
  }>;
}
