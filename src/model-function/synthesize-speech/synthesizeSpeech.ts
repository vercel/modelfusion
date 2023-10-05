import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import {
  SpeechSynthesisModel,
  SpeechSynthesisModelSettings,
} from "./SpeechSynthesisModel.js";

/**
 * Synthesizes speech from text.
 */
export function synthesizeSpeech(
  model: SpeechSynthesisModel<SpeechSynthesisModelSettings>,
  text: string,
  options?: FunctionOptions
): ModelFunctionPromise<Buffer> {
  return executeCall({
    functionType: "speech-synthesis",
    input: text,
    model,
    options,
    generateResponse: async (options) => {
      const response = await model.generateSpeechResponse(text, options);
      return {
        response,
        extractedValue: response,
      };
    },
  });
}
