import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import {
  SpeechSynthesisModel,
  SpeechSynthesisModelSettings,
} from "./SpeechSynthesisModel.js";

/**
 * Synthesizes speech from text.
 */
export function synthesizeSpeech<SETTINGS extends SpeechSynthesisModelSettings>(
  model: SpeechSynthesisModel<SETTINGS>,
  text: string,
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<SpeechSynthesisModel<SETTINGS>, Buffer, Buffer> {
  return executeCall({
    model,
    options,
    generateResponse: (options) => model.generateSpeechResponse(text, options),
    extractOutputValue: (buffer) => buffer,
    getStartEvent: (metadata, settings) => ({
      ...metadata,
      functionType: "speech-synthesis",
      settings,
      text,
    }),
    getAbortEvent: (metadata, settings) => ({
      ...metadata,
      functionType: "speech-synthesis",
      status: "abort",
      settings,
      text,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      ...metadata,
      functionType: "speech-synthesis",
      settings,
      text,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      ...metadata,
      functionType: "speech-synthesis",
      settings,
      text,
      response,
      speech: output,
    }),
  });
}
