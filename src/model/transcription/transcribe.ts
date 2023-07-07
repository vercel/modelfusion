import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  TranscriptionModelSettings,
  TranscriptionModel,
} from "./TranscriptionModel.js";

/**
 * Transcribe audio data into text.
 *
 * @example
 * const data = await fs.promises.readFile("data/test.mp3");
 *
 * const transcription = await transcribe(
 *   new OpenAITranscriptionModel({ model: "whisper-1" }),
 *   {
 *     type: "mp3",
 *     data,
 *   }
 * );
 */
export function transcribe<
  DATA,
  RESPONSE,
  SETTINGS extends TranscriptionModelSettings
>(
  model: TranscriptionModel<DATA, RESPONSE, SETTINGS>,
  data: DATA,
  options?: FunctionOptions<SETTINGS>
): Promise<string> {
  return executeCall({
    model,
    options,
    callModel: (model, options) => transcribe(model, data, options),
    generateResponse: (options) =>
      model.generateTranscriptionResponse(data, options),
    extractOutputValue: model.extractTranscriptionText,
    getStartEvent: (metadata, settings) => ({
      type: "transcription-started",
      metadata,
      settings,
      data,
    }),
    getAbortEvent: (metadata, settings) => ({
      type: "transcription-finished",
      status: "abort",
      settings,
      metadata,
      data,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      type: "transcription-finished",
      status: "failure",
      metadata,
      settings,
      data,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      type: "transcription-finished",
      status: "success",
      metadata,
      settings,
      data,
      response,
      transcription: output,
    }),
  });
}
