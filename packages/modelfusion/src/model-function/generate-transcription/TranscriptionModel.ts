import { DataContent } from "../../util/format/DataContent.js";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TranscriptionModelSettings extends ModelSettings {}

export interface TranscriptionModel<
  SETTINGS extends TranscriptionModelSettings = TranscriptionModelSettings,
> extends Model<SETTINGS> {
  doTranscribe: (
    input: {
      mimeType: string;
      audioData: DataContent;
    },
    options: FunctionCallOptions
  ) => PromiseLike<{
    rawResponse: unknown;
    transcription: string;
  }>;
}
