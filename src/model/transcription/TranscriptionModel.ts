import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TranscriptionModelSettings extends ModelSettings {}

export interface TranscriptionModel<
  DATA,
  SETTINGS extends TranscriptionModelSettings
> extends Model<SETTINGS> {
  /**
   * Transcribe audio data into text.
   *
   * @example
   * const data = await fs.promises.readFile("data/test.mp3");
   * const model = new OpenAITranscriptionModel({ model: "whisper-1" });
   *
   * const transcription = await model.transcribe({
   *   type: "mp3",
   *   data,
   * });
   */
  transcribe(
    data: DATA,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<string>;
}
