import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { Delta } from "../Delta.js";
import { Model, ModelSettings } from "../Model.js";

export interface SpeechGenerationModelSettings extends ModelSettings {}

export interface SpeechGenerationModel<
  SETTINGS extends
    SpeechGenerationModelSettings = SpeechGenerationModelSettings,
> extends Model<SETTINGS> {
  /**
   * Generates an mp3 audio buffer that contains the speech for the given text.
   */
  doGenerateSpeechStandard(
    text: string,
    options: FunctionCallOptions
  ): PromiseLike<Buffer>;
}

export interface StreamingSpeechGenerationModel<
  SETTINGS extends
    SpeechGenerationModelSettings = SpeechGenerationModelSettings,
> extends SpeechGenerationModel<SETTINGS> {
  doGenerateSpeechStreamDuplex(
    textStream: AsyncIterable<string>,
    options: FunctionCallOptions
  ): PromiseLike<AsyncIterable<Delta<Buffer>>>;
}
