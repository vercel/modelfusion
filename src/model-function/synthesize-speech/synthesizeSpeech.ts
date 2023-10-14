import { FunctionOptions } from "../../core/FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import { ModelFunctionPromise } from "../ModelFunctionPromise.js";
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
  return new ModelFunctionPromise(
    executeCall({
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
    })
  );
}
