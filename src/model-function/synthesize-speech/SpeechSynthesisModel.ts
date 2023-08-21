import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface SpeechSynthesisModelSettings extends ModelSettings {}

export interface SpeechSynthesisModel<SETTINGS> extends Model<SETTINGS> {
  /**
   * Generates an mp3 audio buffer that contains the speech for the given text.
   */
  generateSpeechResponse: (
    text: string,
    options?: FunctionOptions<SETTINGS>
  ) => PromiseLike<Buffer>;
}
