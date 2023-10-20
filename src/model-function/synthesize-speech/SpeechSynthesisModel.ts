import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Delta } from "../../model-function/Delta.js";
import { Model, ModelSettings } from "../Model.js";

export interface SpeechSynthesisModelSettings extends ModelSettings {}

export interface SpeechSynthesisModel<
  SETTINGS extends SpeechSynthesisModelSettings = SpeechSynthesisModelSettings,
> extends Model<SETTINGS> {
  /**
   * Generates an mp3 audio buffer that contains the speech for the given text.
   */
  doSynthesizeSpeechStandard(
    text: string,
    options?: FunctionOptions
  ): PromiseLike<Buffer>;
}

export interface DuplexSpeechSynthesisModel<
  SETTINGS extends SpeechSynthesisModelSettings = SpeechSynthesisModelSettings,
> extends SpeechSynthesisModel<SETTINGS> {
  doSynthesizeSpeechStreamDuplex(
    textStream: AsyncIterable<string>,
    options?: FunctionOptions
  ): PromiseLike<AsyncIterable<Delta<Buffer>>>;
}
