import { DataContent } from "../../util/format/DataContent";
import { FunctionCallOptions } from "../../core/FunctionOptions";
import { Model, ModelSettings } from "../Model";

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
