import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import {
  TranscriptionModel,
  TranscriptionModelSettings,
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
  SETTINGS extends TranscriptionModelSettings,
>(
  model: TranscriptionModel<DATA, RESPONSE, SETTINGS>,
  data: DATA,
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<
  TranscriptionModel<DATA, RESPONSE, SETTINGS>,
  string,
  RESPONSE
> {
  return executeCall({
    model,
    options,
    generateResponse: (options) =>
      model.generateTranscriptionResponse(data, options),
    extractOutputValue: model.extractTranscriptionText,
    getStartEvent: (metadata, settings) => ({
      ...metadata,
      functionType: "transcription",
      settings,
      data,
    }),
    getAbortEvent: (metadata, settings) => ({
      ...metadata,
      functionType: "transcription",
      settings,
      data,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      ...metadata,
      functionType: "transcription",
      settings,
      data,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      ...metadata,
      functionType: "transcription",
      settings,
      data,
      response,
      transcription: output,
    }),
  });
}
