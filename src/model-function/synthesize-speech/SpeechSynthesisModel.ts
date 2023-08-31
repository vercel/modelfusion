import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface SpeechSynthesisModelSettings extends ModelSettings {}

export interface SpeechSynthesisModel<
  SETTINGS extends SpeechSynthesisModelSettings,
> extends Model<SETTINGS> {
  /**
   * Generates an mp3 audio buffer that contains the speech for the given text.
   */
  generateSpeechResponse: (
    text: string,
    options?: ModelFunctionOptions<SETTINGS>
  ) => PromiseLike<Buffer>;
}
