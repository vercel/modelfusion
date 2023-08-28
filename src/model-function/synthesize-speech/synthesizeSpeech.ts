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
    functionType: "speech-synthesis",
    input: text,
    model,
    options,
    generateResponse: (options) => model.generateSpeechResponse(text, options),
    extractOutputValue: (buffer) => buffer,
  });
}
