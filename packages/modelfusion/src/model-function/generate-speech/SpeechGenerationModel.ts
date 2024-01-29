import { FunctionCallOptions } from "../../core/FunctionOptions";
import { Delta } from "../Delta";
import { Model, ModelSettings } from "../Model";

export interface SpeechGenerationModelSettings extends ModelSettings {}

export interface SpeechGenerationModel<
  SETTINGS extends
    SpeechGenerationModelSettings = SpeechGenerationModelSettings,
> extends Model<SETTINGS> {
  /**
   * Generates an mp3 audio Uint8Array that contains the speech for the given text.
   */
  doGenerateSpeechStandard(
    text: string,
    options: FunctionCallOptions
  ): PromiseLike<Uint8Array>;
}

export interface StreamingSpeechGenerationModel<
  SETTINGS extends
    SpeechGenerationModelSettings = SpeechGenerationModelSettings,
> extends SpeechGenerationModel<SETTINGS> {
  doGenerateSpeechStreamDuplex(
    textStream: AsyncIterable<string>,
    options: FunctionCallOptions
  ): PromiseLike<AsyncIterable<Delta<Uint8Array>>>;
}
